from pydantic import BaseModel, Field


class DestinationIn(BaseModel):
    destination: str = Field(min_length=1, max_length=254)


class VerifyIn(BaseModel):
    destination: str = Field(min_length=1, max_length=254)
    code: str = Field(min_length=4, max_length=10)


class AuthAck(BaseModel):
    """Deliberately says nothing about whether an account exists.

    dev_code is populated only when LOGIN_CODE_ECHO is on, so the return flow
    is testable without a mail or SMS provider. It must be off in production.
    """

    ok: bool = True
    dev_code: str | None = None


class SessionOut(BaseModel):
    user_id: str
    onboarded: bool
    claimed: bool
