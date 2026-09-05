from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MessageOut(BaseModel):
    id: UUID
    role: str
    text: str = Field(alias="content")
    at: datetime = Field(alias="created_at")
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