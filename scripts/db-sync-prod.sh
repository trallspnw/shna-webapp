#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PROD_DATABASE_URL:-}" ]]; then
  echo "PROD_DATABASE_URL is required." >&2
  exit 1
fi

LOCAL_DATABASE_URL="${LOCAL_DATABASE_URL:-${DATABASE_URL:-}}"
if [[ -z "${LOCAL_DATABASE_URL}" ]]; then
  echo "LOCAL_DATABASE_URL or DATABASE_URL is required." >&2
  exit 1
fi

if [[ "${LOCAL_DATABASE_URL}" != *"localhost"* && "${LOCAL_DATABASE_URL}" != *"127.0.0.1"* ]]; then
  echo "Refusing to restore to a non-local DATABASE_URL." >&2
  exit 1
fi

dump_file="$(mktemp /tmp/shna-prod-db-XXXXXX.dump)"
trap 'rm -f "${dump_file}"' EXIT

echo "Dumping production database..."
pg_dump --format=custom --no-owner --no-privileges "${PROD_DATABASE_URL}" > "${dump_file}"

echo "Restoring into local database..."
# Drop media-linked favicon constraints first to avoid dependency errors during restore.
psql --set ON_ERROR_STOP=1 "${LOCAL_DATABASE_URL}" <<'SQL'
ALTER TABLE IF EXISTS site_settings DROP CONSTRAINT IF EXISTS site_settings_favicon_svg_id_media_id_fk;
ALTER TABLE IF EXISTS site_settings DROP CONSTRAINT IF EXISTS site_settings_favicon_ico_id_media_id_fk;
SQL

pg_restore \
  --clean \
  --exclude-schema=graphql \
  --exclude-schema=vault \
  --if-exists \
  --no-comments \
  --no-data-for-failed-tables \
  --no-owner \
  --no-privileges \
  --no-publications \
  --no-security-labels \
  --no-subscriptions \
  --no-table-access-method \
  --no-tablespaces \
  --file - \
  "${dump_file}" \
  | sed -e '/^SET transaction_timeout = 0;$/d' \
        -e '/^CREATE EXTENSION IF NOT EXISTS pg_graphql /d' \
        -e '/^COMMENT ON EXTENSION pg_graphql /d' \
        -e '/^CREATE EXTENSION IF NOT EXISTS supabase_vault /d' \
        -e '/^COMMENT ON EXTENSION supabase_vault /d' \
  | psql --set ON_ERROR_STOP=1 "${LOCAL_DATABASE_URL}"

echo "Done."
