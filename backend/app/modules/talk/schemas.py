from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MessageOut(BaseModel):
    id: UUID
    role: str
    # validation_alias only, not alias -- this needs to read the ORM's
    # `content`/`created_at` columns when populating from a Message row, but
    # must NOT also write those names back out on serialization. That used
    # to be one `alias=` doing both jobs, which was harmless everywhere this
    # was dumped with response_model_by_alias=False (GET /talk/conversation)
    # but silently leaked `content`/`created_at` into GET /me/export, whose
    # WireModel wrapper dumps by alias -- found by inspecting a real export
    # payload while verifying F2, not by a test.
    text: str = Field(validation_alias="content")
    at: datetime = Field(validation_alias="created_at")
    status: str

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }


class ConversationOut(BaseModel):
    # None means no conversation exists yet -- the same convention as
    # getCheckIn / getCrisisPlan elsewhere in this API, rather than a sentinel
    # UUID standing in for "nothing here".
    id: UUID | None
    messages: list[MessageOut]


class SendMessageIn(BaseModel):
    conversation_id: UUID | None = None

    text: str = Field(
        min_length=1,
        max_length=8000,
    )