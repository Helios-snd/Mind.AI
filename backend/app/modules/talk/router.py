from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
)
from fastapi.responses import StreamingResponse

from app.api.v1.deps import onboarded_user
from app.db.session import get_session
from app.modules.talk.models import Conversation
from app.modules.talk.schemas import (
    ConversationOut,
    MessageOut,
    SendMessageIn,
)
from app.modules.talk.service import (
    load_active_conversation,
    resolve_countdown,
    send_message_stream,
)
from app.modules.users.models import (
    User,
    UserProfile,
)


router = APIRouter(
    prefix="/talk",
    tags=["talk"],
)


@router.get(
    "/conversation",
    response_model=ConversationOut,
    # MessageOut.text carries alias="content" so from_attributes=True can
    # read it off the ORM row -- FastAPI's response_model serialization
    # defaults to by-alias, which would silently emit "content"/"created_at"
    # over the wire instead of the "text"/"at" the frontend's ChatMessage
    # contract actually expects. This keeps the wire shape on the field
    # names regardless of what the alias is for.
    response_model_by_alias=False,
)
async def get_conversation(
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> ConversationOut:

    conversation, messages = (
        await load_active_conversation(
            session,
            user.id,
        )
    )

    if conversation is None:
        return ConversationOut(
            id=None,
            messages=[],
        )

    return ConversationOut(
        id=conversation.id,
        messages=[
            MessageOut.model_validate(message)
            for message in messages
        ],
    )


@router.post("/messages")
async def send_message(
    payload: SendMessageIn,
    request: Request,
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> StreamingResponse:

    text = payload.text.strip()

    if not text:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty",
        )

    if await request.is_disconnected():
        raise HTTPException(
            status_code=499,
            detail="Client disconnected",
        )

    if payload.conversation_id:

        exists = await session.scalar(
            select(Conversation.id)
            .where(
                Conversation.id
                == payload.conversation_id,
                Conversation.user_id
                == user.id,
            )
        )

        if exists is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found",
            )

    profile = await session.get(
        UserProfile,
        user.id,
    )

    language = (
        profile.language
        if profile
        else "en"
    )

    generator = send_message_stream(
        session,
        user.id,
        text,
        payload.conversation_id,
        language,
    )

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/safety/{assessment_id}/cancel",
    status_code=204,
)
async def cancel_countdown(
    assessment_id: UUID,
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    await resolve_countdown(
        session,
        user.id,
        assessment_id,
        "cancelled",
    )
    return Response(status_code=204)


@router.post(
    "/safety/{assessment_id}/expire",
    status_code=204,
)
async def expire_countdown(
    assessment_id: UUID,
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    await resolve_countdown(
        session,
        user.id,
        assessment_id,
        "expired",
    )
    return Response(status_code=204)


@router.delete(
    "/conversation",
    status_code=204,
)
async def delete_conversation(
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> Response:

    conversation, _ = (
        await load_active_conversation(
            session,
            user.id,
        )
    )

    if conversation is not None:
        await session.delete(conversation)
        await session.commit()

    return Response(status_code=204)