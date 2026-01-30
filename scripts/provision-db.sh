set -euo pipefail

SERVICE_NAME="${1:-}"
MODE="${2:-dev}"

if [[ -z "${SERVICE_NAME}" ]]; then
  echo "ERROR: missing service name."
  echo "Usage: $0 <service-name> <dev|prod>"
  exit 1
fi

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
PG_SERVICE="${PG_SERVICE:-postgres}"
PG_SUPERUSER="${PG_SUPERUSER:-postgres}"

SCOPE="${SERVICE_NAME//-/_}"

DB_USER="${DB_USER:-${SCOPE}_user}"
DB_PASS="${DB_PASS:-${SCOPE}_pass}"
DB_NAME="${DB_NAME:-${SCOPE}_db}"

echo "==> Provisioning Postgres for: ${SERVICE_NAME}"
echo "    compose file : ${COMPOSE_FILE}"
echo "    pg service   : ${PG_SERVICE}"
echo "    mode         : ${MODE}"
echo "    db           : ${DB_NAME}"
echo "    user         : ${DB_USER}"

CREATEDB_SQL="ALTER ROLE \"${DB_USER}\" NOCREATEDB;"
if [[ "${MODE}" == "dev" ]]; then
  CREATEDB_SQL="ALTER ROLE \"${DB_USER}\" CREATEDB;"
fi

docker compose -f "${COMPOSE_FILE}" exec -T "${PG_SERVICE}" psql -U "${PG_SUPERUSER}" <<SQL
-- 1) Create role if not exists
DO
\$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE "${DB_USER}" LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;

-- 2) Set privilege for shadow DB (dev) or lock down (prod)
${CREATEDB_SQL}

-- 3) Create database if not exists (psql meta command required)
SELECT format('CREATE DATABASE %I OWNER %I', '${DB_NAME}', '${DB_USER}')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}')
\\gexec

-- 4) Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "${DB_USER}";
SQL

echo "==> Done."
echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@postgres:5432/${DB_NAME}?schema=public\""
