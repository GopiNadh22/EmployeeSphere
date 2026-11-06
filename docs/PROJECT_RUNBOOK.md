# EmployeeSphere DevOps runbook

## Order of implementation and verification
1. Local Docker Compose: validate Dockerfiles, API path, DB readiness and migrations.
2. Tests: run backend pytest and frontend `npm ci && npm run build`.
3. Jenkins: configure a webhook and run CI without deployment first.
4. AWS: check pricing/account eligibility, then use Terraform to create one EC2 host.
5. Ansible: install Docker and configure the host.
6. Deploy Compose and verify health endpoint.
7. Enable Jenkins deployment only after a successful manual deployment.
8. Kubernetes: validate locally with kind/K3d; don't use paid EKS for a zero-budget requirement.
9. Cleanup: manually inspect Terraform destroy plan, destroy, then inspect AWS console and billing.

## Current implementation limitations
- The EC2 Terraform module uses the default VPC and first available default subnet; adapt for production networking.
- No TLS/domain is provisioned. Public demo is HTTP on the configured port; do not send real sensitive data.
- Jenkins installation and webhook configuration require a deliberate secured setup; don't expose port 8080 to everyone.
- Kubernetes images must be built and pushed/loaded before applying manifests.
- Kubernetes Secret templates are placeholders, not production secret management.
- Validate the supplied manifests and Ansible playbooks in a disposable local environment before using AWS.
