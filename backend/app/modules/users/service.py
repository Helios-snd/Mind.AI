"""Reads for the student's own profile, summary, data inventory, and export.

Each is a distinct concern with its own source, deliberately kept apart
rather than folded into one another:
  - get_profile    identity (GET /me)
  - get_summary    a plain-language safety/screening rollup (F1, GET /me/summary)
  - get_data_inventory   the pieces of /data that F1's summary doesn't cover
  - get_export     everything, composed from the functions above plus every
                   other module's own service -- the one function allowed to
                   reach across all of them, so nothing here duplicates a
                   calculation that already lives somewhere else.
"""

from datetime import timedelta
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import utcnow
from app.modules.checkins import service as checkins_service
from app.modules.checkins.models import Signal
from app.modules.escalations import service as escalations_service
from app.modules.escalations.schemas import EscalationHistoryItemOut
from app.modules.onboarding import service as onboarding_service
from app.modules.onboarding.models import ConsentEvent, OnboardingProgress
from app.modules.screening.models import ScreeningSession
from app.modules.talk import service as talk_service
from app.modules.talk.schemas import MessageOut
from app.modules.talk.safety_models import SafetyAssessment
from app.modules.users.models import UserProfile
from app.modules.users.schemas import (
    ConsentEventOut,
    ConversationExportOut,
    DataInventoryOut,
    MeExportOut,
    MeOut,
    MeSummaryOut,
    ScreeningHistoryItemOut,
    SafetySummaryOut,
    SignalExportOut,
)

# How far back "recent" looks for the safety flag count. A single window is
# enough until there's a reason to make it configurable.
SAFETY_RECENT_WINDOW_DAYS = 30


async def get_profile(session: AsyncSession, user_id: UUID) -> MeOut:
    profile = await session.get(UserProfile, user_id)
    progress = await session.get(OnboardingProgress, user_id)
    return MeOut(
        user_id=str(user_id),
        language=profile.language if profile else "en",
        name=profile.name if profile else None,
        email=profile.email if profile else None,
        phone=profile.phone if profile else None,
        claimed=bool(profile and profile.claimed_at),
        onboarded=bool(progress and progress.completed_at),
    )


async def get_summary(session: AsyncSession, user_id: UUID) -> MeSummaryOut:
    cutoff = utcnow() - timedelta(days=SAFETY_RECENT_WINDOW_DAYS)

    recent_flag_count = await session.scalar(
        select(func.count())
        .select_from(SafetyAssessment)
        .where(
            SafetyAssessment.user_id == user_id,
            SafetyAssessment.tier >= 2,
            SafetyAssessment.created_at >= cutoff,
        )
    )

    pending_review = await session.scalar(
        select(SafetyAssessment.id)
        .where(
            SafetyAssessment.user_id == user_id,
            SafetyAssessment.review_status == "pending",
        )
        .limit(1)
    )

    sessions = await session.scalars(
        select(ScreeningSession)
        .where(ScreeningSession.user_id == user_id)
        .order_by(ScreeningSession.completed_at.desc())
    )

    return MeSummaryOut(
        safety=SafetySummaryOut(
            recent_flag_count=recent_flag_count or 0,
            pending_review=pending_review is not None,
        ),
        screenings=[
            ScreeningHistoryItemOut(
                instrument=row.instrument,
                completed_at=row.completed_at.isoformat(),
            )
            for row in sessions
        ],
    )


async def _list_consent_events(
    session: AsyncSession, user_id: UUID
) -> list[ConsentEventOut]:
    rows = await session.scalars(
        select(ConsentEvent)
        .where(ConsentEvent.user_id == user_id)
        .order_by(ConsentEvent.at.asc())
    )
    return [
        ConsentEventOut(kind=row.kind, policy_version=row.policy_version, at=row.at)
        for row in rows
    ]


async def get_data_inventory(session: AsyncSession, user_id: UUID) -> DataInventoryOut:
    signals_count = await session.scalar(
        select(func.count()).select_from(Signal).where(Signal.user_id == user_id)
    )

    return DataInventoryOut(
        signals_count=signals_count or 0,
        consent_events=await _list_consent_events(session, user_id),
    )


async def get_export(session: AsyncSession, user_id: UUID) -> MeExportOut:
    profile = await get_profile(session, user_id)
    onboarding = await onboarding_service.build_progress(session, user_id)
    consent_events = await _list_consent_events(session, user_id)
    check_ins = await checkins_service.list_check_ins(session, user_id)

    signal_rows = await session.scalars(
        select(Signal).where(Signal.user_id == user_id).order_by(Signal.observed_at.asc())
    )
    signals = [
        SignalExportOut(
            kind=row.kind, value=row.value, source=row.source, observed_at=row.observed_at
        )
        for row in signal_rows
    ]

    summary = await get_summary(session, user_id)

    conversation, messages = await talk_service.load_active_conversation(session, user_id)
    conversation_export = ConversationExportOut(
        message_count=len(messages),
        messages=[MessageOut.model_validate(m) for m in messages],
    )

    history_rows = await escalations_service.get_history(session, user_id)
    escalation_history = [
        EscalationHistoryItemOut(
            status=event.status,
            reason_summary_key=brief.reason_summary_key if brief else "",
            created_at=event.created_at,
            resolved_at=event.resolved_at,
        )
        for event, brief in history_rows
    ]

    return MeExportOut(
        exported_at=utcnow(),
        profile=profile,
        onboarding=onboarding,
        consent_events=consent_events,
        check_ins=check_ins,
        signals=signals,
        safety=summary.safety,
        screenings=summary.screenings,
        conversation=conversation_export,
        escalation_history=escalation_history,
    )
