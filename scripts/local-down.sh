#!/usr/bin/env sh
set -eu
docker compose -f compose.yaml down
echo "Containers stopped. Database volume was preserved."
echo "To DELETE local database data too, run: docker compose -f compose.yaml down -v"
