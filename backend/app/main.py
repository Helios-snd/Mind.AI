"""Mind.AI backend entrypoint.

CORS is deliberately absent. The frontend proxies /api/v1/* through Next
(see next.config.mjs), which makes every request same-origin and the session
cookie first-party. Adding CORS here would be a sign the proxy has been
bypassed and the cookie is about to stop working.
"""

import logging

from fastapi import FastAPI

from app.core.config import settings
from app.core.errors import install_error_handlers
from app.core.logging import configure_logging
from app.api.v1.router import api_router

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    configure_logging()

    app = FastAPI(
        title="Mind.AI API",
        version="0.1.0",
        docs_url="/docs" if settings.is_dev else None,
        redoc_url=None,
        openapi_url="/openapi.json" if settings.is_dev else None,
    )

    install_error_handlers(app)
    app.include_router(api_router)

    @app.get("/healthz", tags=["ops"])
    async def healthz() -> dict[str, str]:
        return {"status": "ok", "env": settings.env}

    return app


app = create_app()
