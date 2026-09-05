"""Create a counsellor account.

The only way one gets created -- there is no signup endpoint (see the G
plan's provisioning decision: a CLI script, not a self-serve flow, since
nothing like an admin/invite system exists anywhere in this app).

Usage:
    uv run python -m app.scripts.create_counsellor <email> <name>

The password is prompted for interactively (getpass), never taken as a CLI
argument, so it never lands in shell history or a process list.
"""

import argparse
import asyncio
import getpass
import sys

from app.db.session import SessionFactory
from app.modules.counsellors import service


async def _run(email: str, name: str, password: str) -> None:
    async with SessionFactory() as session:
        counsellor = await service.create_counsellor(session, email, name, password)
        await session.commit()
        print(f"Created counsellor {counsellor.email} ({counsellor.id})")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("email")
    parser.add_argument("name")
    args = parser.parse_args()

    password = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        print("Passwords did not match.", file=sys.stderr)
        raise SystemExit(1)
    if len(password) < 8:
        print("Password must be at least 8 characters.", file=sys.stderr)
        raise SystemExit(1)

    asyncio.run(_run(args.email, args.name, password))


if __name__ == "__main__":
    main()
