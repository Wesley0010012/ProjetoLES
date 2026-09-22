#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# Nome fixo exclusivo: nunca remove o volume da stack de demonstração.
compose=(docker compose --env-file /dev/null -p libra-e2e -f docker-compose.yml -f e2e/compose.yml)
cleanup() {
  "${compose[@]}" down -v --remove-orphans
  docker run --rm -v "$PWD/e2e:/e2e" node:22-alpine sh -c '
    mkdir -p /e2e/results /e2e/cypress/screenshots /e2e/cypress/videos
    chown -R "$1:$2" /e2e/results /e2e/cypress/screenshots /e2e/cypress/videos
  ' sh "$(id -u)" "$(id -g)"
}
trap cleanup EXIT
cleanup
mkdir -p e2e/results
find e2e/results -maxdepth 1 -name 'junit-*.xml' -delete
"${compose[@]}" up -d --build --wait nginx
"${compose[@]}" run --rm cypress "$@"
