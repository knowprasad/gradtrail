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

if [[ -f .env ]]; then
  echo "Using the existing .env so this setup keeps its password and data."
  docker compose up -d --build
  echo "Open http://localhost:3000 when the app is ready."
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
echo "Setup is complete. Open http://localhost:3000 and sign in with the password you chose."
