#!/usr/bin/env sh
set -eu
[ -f .env ] || { echo "Missing .env. Copy .env.example to .env and set secrets."; exit 1; }
docker compose -f compose.yaml up -d --build
docker compose -f compose.yaml ps
