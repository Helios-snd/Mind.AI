from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import utcnow
from app.agents.signal_extraction import extract_from_message
from app.modules.checkins.models import Signal
from app.modules.talk.models import Conversation, Message


async def get_or_create_conversation(
    session: AsyncSession,
    user_id: UUID,
    conversation_id: UUID | None,
) -> Conversation:

    if conversation_id is not None:
        conversation = await session.scalar(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        )

        if conversation is None:
            raise ValueError("Conversation not found")

        return conversation

    conversation = await session.scalar(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(
            Conversation.last_message_at.desc().nullslast(),
            Conversation.created_at.desc(),
        )
        .limit(1)
    )

    if conversation:
        return conversation

    conversation = Conversation(
        user_id=user_id,
        last_message_at=utcnow(),
    )

    session.add(conversation)

    await session.flush()

    return conversation


async def next_sequence(
    session: AsyncSession,
    conversation_id: UUID,
) -> int:

    current = await session.scalar(
        select(func.max(Message.sequence)).where(
            Message.conversation_id == conversation_id
        )
    )

    return int(current or 0) + 1


async def add_message(
    session: AsyncSession,
    *,
    user_id: UUID,
    conversation_id: UUID,
    role: str,
    content: str,
    status: str = "completed",
) -> Message:

    conversation = await session.scalar(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        .with_for_update()
    )

    if conversation is None:
        raise ValueError("Conversation not found")

    message = Message(
        user_id=user_id,
        conversation_id=conversation_id,
        role=role,
        content=content,
        status=status,
        sequence=await next_sequence(
            session,
            conversation_id,
        ),
    )

    session.add(message)

    conversation.last_message_at = utcnow()

    await session.flush()

    return message


async def list_messages(
    session: AsyncSession,
    user_id: UUID,
    conversation_id: UUID,
) -> list[Message]:

    result = await session.scalars(
        select(Message)
        .where(
            Message.user_id == user_id,
            Message.conversation_id == conversation_id,
        )
        .order_by(Message.sequence.asc())
    )

    return list(result.all())

async def persist_message_signals(
    session: AsyncSession,
    user_id: UUID,
    message: Message,
) -> None:
    """SIGNAL over a user message, stored in the same `signals` table Today
    writes to -- with source_type="message" so a query over all of a
    student's signals sees both origins without a separate table.

    Assistant messages carry nothing to extract (SIGNAL reads what the
    student reported, not what Companion said back), so this is only ever
    called for role="user" messages.
    """
    for extracted in extract_from_message(message.content):
        session.add(
            Signal(
                user_id=user_id,
                source_type="message",
                source_id=message.id,
                source=extracted.source,
                kind=extracted.kind,
                value=extracted.value,
                observed_at=message.created_at,
            )
        )
    await session.flush()
