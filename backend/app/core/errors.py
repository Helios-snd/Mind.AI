"""Typed application errors and their JSON representation.

The frontend surfaces any thrown error through the existing OnboardingError
state ("Something did not load. You can try again."), so the shape here only
needs to be stable and free of student content.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    status_code = status.HTTP_400_BAD_REQUEST
    error_type = "about:blank"
    title = "Request failed"

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.title
        super().__init__(self.detail)


class NotAuthenticated(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    error_type = "urn:mindai:not-authenticated"
    title = "No valid session"


class OnboardingIncomplete(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    error_type = "urn:mindai:onboarding-incomplete"
    title = "Onboarding is not finished"


class NotFound(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    error_type = "urn:mindai:not-found"
    title = "Not found"


class ValidationFailed(AppError):
    status_code = 422  # unprocessable; the constant name moved between Starlette versions
    error_type = "urn:mindai:validation-failed"
    title = "That does not look right"


class TooManyAttempts(AppError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    error_type = "urn:mindai:too-many-attempts"
    title = "Too many attempts"


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _handle(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "type": exc.error_type,
                "title": exc.title,
                "detail": exc.detail,
            },
        )
