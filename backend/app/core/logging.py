"""Structured logging.

Hard rule from docs/blueprint/08-safety-and-privacy.md section 6: this logger
never receives student content. Not check-in notes, not conversation messages,
not crisis-plan fields, not contact names or phone numbers, not screening
answers. Log the fact, the user id, the timestamp and the verdict -- never the
text. A log aggregator is not controlled infrastructure.
"""

import json
import logging
import sys
from datetime import datetime, timezone

from app.core.config import settings

# Field names that must never appear in a log record's extras.
FORBIDDEN_FIELDS = frozenset(
    {
        "note",
        "text",
        "message",
        "body",
        "who_id_call",
        "what_helps",
        "what_makes_it_worse",
        "name",
        "phone",
        "email",
        "code",
        "answers",
        "transcript",
    }
)


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        for key, value in getattr(record, "context", {}).items():
            if key in FORBIDDEN_FIELDS:
                payload[key] = "<redacted>"
            else:
                payload[key] = value
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(settings.log_level.upper())

    # uvicorn's access log duplicates what we emit and carries full query strings.
    logging.getLogger("uvicorn.access").disabled = True


def log_event(logger: logging.Logger, message: str, **context) -> None:
    """Emit one structured event. Forbidden keys are redacted, not dropped, so
    an accidental content leak is visible in review rather than silent."""
    logger.info(message, extra={"context": context})
