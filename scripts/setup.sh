#!/usr/bin/env bash
# Guided first run for macOS and Linux users with Docker Compose.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker was not found. Install Docker Desktop (macOS) or Docker Engine with Compose (Linux), then retry." >&2
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop or the Docker service, then retry." >&2
  exit 1
fi

wait_for_app() {
  local port="$1"
  echo "Waiting for GradTrail at http://localhost:${port} …"
  for _ in $(seq 1 60); do
    if curl -fsS --max-time 3 "http://localhost:${port}/login" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  echo "GradTrail didn't become ready. Check startup with 'docker compose logs --tail 80 app'." >&2
  return 1
}

if [[ -f .env ]]; then
  port="$(sed -n 's/^[[:space:]]*GRADTRAIL_PORT[[:space:]]*=[[:space:]]*//p' .env | head -n 1 | tr -d "'\"[:space:]")"
  port="${port:-3000}"
  echo "Found an existing .env. Reusing its password and database; setup won't ask you to choose a new password."
  docker compose up -d --build
  wait_for_app "$port"
  echo "GradTrail is ready at http://localhost:${port}. Sign in with the password you chose previously."
  exit 0
fi

read -rsp "Choose a sign-in password (12+ characters): " password
echo
read -rsp "Enter it again: " confirmation
echo
if [[ ${#password} -lt 12 ]]; then
  echo "Use at least 12 characters." >&2
  exit 1
fi
if [[ "$password" != "$confirmation" ]]; then
  echo "Those passwords don't match. Run setup again and retry." >&2
  exit 1
fi

echo "Preparing the app. The first build downloads dependencies and may take a few minutes."
docker compose build app
password_hash="$(printf '%s\n' "$password" | docker compose run -T --rm --no-deps app yarn hash-password | sed -n '/^argon2id:m=/p' | tail -n 1)"
unset password confirmation
if [[ ! "$password_hash" =~ ^argon2id:m= ]]; then
  echo "Could not prepare the sign-in password. Try running the setup again." >&2
  exit 1
fi

umask 077
{
  printf "POSTGRES_PASSWORD='%s'\n" "$(openssl rand -hex 32)"
  printf "GRADTRAIL_PASSWORD='%s'\n" "$password_hash"
  printf "GRADTRAIL_SECRET='%s'\n" "$(openssl rand -base64 32 | tr -d '\n')"
  printf 'GRADTRAIL_PORT=3000\nPOSTGRES_PORT=5433\n'
} > .env
docker compose up -d
wait_for_app 3000
echo "Setup is complete. Open http://localhost:3000 and sign in with the password you chose."
