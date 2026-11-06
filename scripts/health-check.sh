#!/usr/bin/env sh
set -eu
URL="${1:-http://localhost:8080}"
echo "Checking frontend at $URL ..."
curl --fail --silent --show-error "$URL/" >/dev/null
echo "Checking API health ..."
curl --fail --silent --show-error "$URL/health"
echo
