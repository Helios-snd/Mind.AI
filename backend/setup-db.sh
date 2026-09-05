#!/usr/bin/env bash
# One-time database setup for slice 1.
#
# Your PostgreSQL 18 (EDB, /Library/PostgreSQL/18) uses password auth, so this
# will prompt. To avoid repeated prompts, export PGPASSWORD first:
#   export PGPASSWORD=...   ./setup-db.sh
set -euo pipefail

PGUSER="${PGUSER:-postgres}"
PGHOST="${PGHOST:-localhost}"

echo "==> creating databases"
createdb -h "$PGHOST" -U "$PGUSER" mindai      2>/dev/null || echo "    mindai already exists"
createdb -h "$PGHOST" -U "$PGUSER" mindai_test 2>/dev/null || echo "    mindai_test already exists"

if [ ! -f .env ]; then
  echo "==> writing .env with a generated JWT_SECRET"
  SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(48))")
  PASS="${PGPASSWORD:-CHANGEME}"
  sed -e "s|JWT_SECRET=CHANGEME|JWT_SECRET=${SECRET}|" \
      -e "s|postgres:CHANGEME@|${PGUSER}:${PASS}@|" \
      .env.example > .env
  [ "$PASS" = "CHANGEME" ] && echo "    !! set the password in .env before continuing"
else
  echo "==> .env already exists, leaving it alone"
fi

echo "==> applying migrations"
./.venv/bin/alembic upgrade head

echo "==> done. start with:"
echo "    ./.venv/bin/uvicorn app.main:app --reload --port 8000"
