"""Conversation/message persistence: creation, sequencing, and the
signal-extraction side effect of saving a message."""

import uuid

import pytest
from sqlalchemy import select

from app.modules.checkins.models import Signal
from app.modules.talk.models import Conversation, Message
from app.modules.talk.repository import (
    add_message,
    get_or_create_conversation,
    list_messages,
    next_sequence,
    persist_message_signals,
)
from app.modules.users.models import User


async def _make_user(session) -> User:
    user = User()
    session.add(user)
    await session.flush()
    return user


async def test_get_or_create_makes_one_conversation_for_a_new_user(session):
    user = await _make_user(session)
    conversation = await get_or_create_conversation(session, user.id, None)
    assert conversation.user_id == user.id

    again = await get_or_create_conversation(session, user.id, None)
    assert again.id == conversation.id  # reused, not duplicated


async def test_get_or_create_returns_the_most_recently_active_conversation(session):
    user = await _make_user(session)
    older = await get_or_create_conversation(session, user.id, None)

    # A second conversation, more recently active.
    newer = Conversation(user_id=user.id)
    session.add(newer)
    await session.flush()
    await add_message(
        session, user_id=user.id, conversation_id=newer.id, role="user", content="hi"
    )

    found = await get_or_create_conversation(session, user.id, None)
    assert found.id == newer.id
    assert found.id != older.id


async def test_an_explicit_conversation_id_is_honoured(session):
    user = await _make_user(session)
    first = await get_or_create_conversation(session, user.id, None)
    second = Conversation(user_id=user.id)
    session.add(second)
    await session.flush()

    found = await get_or_create_conversation(session, user.id, first.id)
    assert found.id == first.id


async def test_a_conversation_id_belonging_to_another_user_is_refused(session):
    owner = await _make_user(session)
    other = await _make_user(session)
    conversation = await get_or_create_conversation(session, owner.id, None)

    with pytest.raises(ValueError):
        await get_or_create_conversation(session, other.id, conversation.id)


async def test_an_unknown_conversation_id_is_refused(session):
    user = await _make_user(session)
    with pytest.raises(ValueError):
        await get_or_create_conversation(session, user.id, uuid.uuid4())


async def test_sequence_numbers_increase_monotonically(session):
    user = await _make_user(session)
    conversation = await get_or_create_conversation(session, user.id, None)

    assert await next_sequence(session, conversation.id) == 1

    first = await add_message(
        session, user_id=user.id, conversation_id=conversation.id, role="user", content="a"
    )
    assert first.sequence == 1

    second = await add_message(
        session, user_id=user.id, conversation_id=conversation.id, role="assistant", content="b"
    )
    assert second.sequence == 2


async def test_add_message_updates_the_conversations_last_message_at(session):
    user = await _make_user(session)
    conversation = await get_or_create_conversation(session, user.id, None)
    assert conversation.last_message_at is not None  # set at creation

    before = conversation.last_message_at
    await add_message(
        session, user_id=user.id, conversation_id=conversation.id, role="user", content="hi"
    )
    await session.flush()
    await session.refresh(conversation)
    assert conversation.last_message_at >= before


async def test_add_message_to_an_unknown_conversation_is_refused(session):
    user = await _make_user(session)
    with pytest.raises(ValueError):
        await add_message(
            session,
            user_id=user.id,
            conversation_id=uuid.uuid4(),
            role="user",
            content="hi",
        )


async def test_list_messages_returns_them_in_sequence_order(session):
    user = await _make_user(session)
    conversation = await get_or_create_conversation(session, user.id, None)
    for text in ("first", "second", "third"):
        await add_message(
            session,
            user_id=user.id,
            conversation_id=conversation.id,
            role="user",
            content=text,
        )

    rows = await list_messages(session, user.id, conversation.id)
    assert [row.content for row in rows] == ["first", "second", "third"]


async def test_list_messages_is_scoped_to_the_conversation(session):
    user = await _make_user(session)
    a = await get_or_create_conversation(session, user.id, None)
    b = Conversation(user_id=user.id)
    session.add(b)
    await session.flush()

    await add_message(session, user_id=user.id, conversation_id=a.id, role="user", content="in a")
    await add_message(session, user_id=user.id, conversation_id=b.id, role="user", content="in b")

    rows = await list_messages(session, user.id, a.id)
    assert [row.content for row in rows] == ["in a"]


# --- SIGNAL side effect of saving a message ---------------------------------


async def test_persist_message_signals_records_a_topic_mention(session):
    user = await _make_user(session)
    conversation = await get_or_create_conversation(session, user.id, None)
    message = await add_message(
        session,
        user_id=user.id,
        conversation_id=conversation.id,
        role="user",
        content="I'm so ghabrahat about my exam tomorrow",
    )

    await persist_message_signals(session, user.id, message)

    rows = (
        await session.scalars(select(Signal).where(Signal.source_id == message.id))
    ).all()
    kinds = {row.kind for row in rows}
    assert "anxiety_language" in kinds
    assert "exam_pressure" in kinds
    assert all(row.source_type == "message" for row in rows)
    assert all(row.source == "conversation" for row in rows)


async def test_persist_message_signals_extracts_a_stated_sleep_number(session):
    user = await _make_user(session)
    conversation = await get_or_create_conversation(session, user.id, None)
    message = await add_message(
        session,
        user_id=user.id,
        conversation_id=conversation.id,
        role="user",
        content="I only slept 4 hours last night",
    )

    await persist_message_signals(session, user.id, message)

    row = (
        await session.scalars(
            select(Signal).where(Signal.source_id == message.id, Signal.kind == "sleep")
        )
    ).one()
    assert row.value == {"unit": "hours", "value": 4.0}


async def test_persist_message_signals_writes_nothing_for_an_ordinary_message(session):
    user = await _make_user(session)
    conversation = await get_or_create_conversation(session, user.id, None)
    message = await add_message(
        session,
        user_id=user.id,
        conversation_id=conversation.id,
        role="user",
        content="What time does the library close?",
    )

    await persist_message_signals(session, user.id, message)

    rows = (
        await session.scalars(select(Signal).where(Signal.source_id == message.id))
    ).all()
    assert rows == []
