# EmployeeSphere deployment architecture

One source repository supports:
1. Local Docker Compose development.
2. Temporary AWS EC2 deployment using the same Compose stack.
3. Future Kubernetes deployment using the same application images.

Browser traffic reaches Nginx on port 80 (host port 8080 by default). Nginx serves the Vite build and proxies `/api/*` to FastAPI. FastAPI connects to PostgreSQL using the internal Compose DNS name `db`. PostgreSQL is not published to the host.

The frontend is built with `VITE_API_URL=/api`, so it does not contain a laptop IP or EC2 public IP. The browser uses a same-origin `/api` path in both environments.

Database schema changes are applied by Alembic before Uvicorn starts. The PostgreSQL named volume survives `docker compose down`; `down -v` deletes it and must be treated as destructive.
