# Local Docker deployment

## Prerequisites
- Git
- Docker Desktop (Windows/macOS) or Docker Engine + Compose plugin (Linux)
- At least 4 GB RAM available to Docker is recommended

## Start
1. Copy `.env.example` to `.env`.
2. Set a unique `DB_PASSWORD` and `SECRET_KEY`. Keep `.env` private.
3. Make sure `DATABASE_URL` uses the same username/password/database and host `db`.
4. Run `docker compose up -d --build`.
5. Open `http://localhost:8080`.
6. API health: `http://localhost:8080/health`; API docs: `http://localhost:8080/docs`.

## Stop safely
Run `docker compose down`. This preserves the named PostgreSQL volume.
To intentionally delete local database data too, run `docker compose down -v`.
