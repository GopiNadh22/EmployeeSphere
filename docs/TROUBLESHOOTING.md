# Troubleshooting

- `DB_PASSWORD` / `SECRET_KEY` missing: create `.env` from `.env.example` and set both.
- Database not ready: `docker compose logs db`; wait for the health check.
- Backend migration failure: `docker compose logs backend`; do not delete the database volume. Inspect the Alembic error first.
- API not reachable: `docker compose ps` and `docker compose logs backend frontend`.
- Frontend route refresh returns 404: verify Nginx `try_files ... /index.html`.
- API calls go to localhost: verify frontend image build arg `VITE_API_URL=/api` and rebuild frontend.
- Port 8080 busy: set `APP_PORT` in `.env` to another free host port.
- Keep `.env` and credentials out of Git, screenshots and logs.
