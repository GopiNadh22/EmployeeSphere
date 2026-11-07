# EmployeeSphere — reusable DevOps deployment

## Deployment choices
- Local: Docker Compose on a developer laptop; no AWS account required.
- AWS demo: optional temporary EC2 deployment; AWS costs are possible.
- Kubernetes: future target; learn locally with kind/K3d before considering paid cloud clusters.

## Quick start
```bash
cp .env.example .env
# Edit .env: set DB_PASSWORD and SECRET_KEY to strong unique values
docker compose up -d --build
```
Open `http://localhost:8080`.

## Stop
```bash
docker compose down
```
This preserves PostgreSQL data. `docker compose down -v` deletes it.

## CI/CD
`Jenkinsfile` runs backend tests, frontend build and Docker image build. Its deploy stage runs on `main` only when `/opt/employeesphere/.env` exists on the Jenkins agent host. Configure GitHub webhook and Jenkins credentials securely. Never commit `.env`.

## Files
- `compose.yaml`: local and EC2 Docker Compose stack
- `docker/`: backend/frontend images and Nginx reverse proxy
- `Jenkinsfile`: CI/CD pipeline
- `scripts/`: local startup, stop and health-check helpers
- `docs/`: architecture, local setup, AWS warning, cleanup and Kubernetes roadmap

## Security and cost
The app requires strong environment secrets. PostgreSQL is internal-only. Do not expose Jenkins publicly without access restrictions and HTTPS. AWS is not guaranteed free; verify current account credits and all resource charges before creating anything.
\n\n## Infrastructure and orchestration\n- Terraform: `infrastructure/terraform/`\n- Ansible: `ansible/`\n- Kubernetes manifests: `deployment/kubernetes/base/`\n- Helm chart: `deployment/kubernetes/helm/employeesphere/`\n- Monitoring starter: `monitoring/`\n- End-to-end runbook: `docs/PROJECT_RUNBOOK.md`\n# Webhook test
