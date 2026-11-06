# Temporary AWS deployment (cost warning)

AWS EC2 is NOT guaranteed to be free. Check your account's current Free Tier/credits, instance, EBS, public IPv4, data transfer and regional pricing before provisioning. Do not proceed if the estimate is not acceptable. This repository does not automatically create AWS resources.

Suggested learning topology: one temporary Ubuntu EC2 host runs Docker Compose and Jenkins. This is for a demonstration, not production. Jenkins and the application compete for memory; a small free-eligible instance may not have enough resources. Do not expose Jenkins (8080) or PostgreSQL (5432) publicly. Restrict SSH to your own IP and use HTTPS/reverse proxy for public production use.

## Manual deployment outline
1. Provision an Ubuntu EC2 instance only after checking cost.
2. Install Docker Engine and the Compose plugin.
3. Clone this repository to `/opt/employeesphere`.
4. Create `/opt/employeesphere/.env` from `.env.example`, set unique secrets, and restrict file permissions (`chmod 600 .env`).
5. Run `docker compose up -d --build`.
6. Configure Jenkins securely and point its pipeline to this repository. Install required Jenkins plugins (Pipeline, Git, GitHub integration, Workspace Cleanup).
7. Configure GitHub webhook to Jenkins and protect the Jenkins endpoint. Store credentials in Jenkins Credentials, never in Git.
8. Ensure the Jenkins service user has only the required deployment permissions. Docker socket access is effectively root-level; understand this risk.

For CI/CD on the same host, the Jenkinsfile deploy stage expects `/opt/employeesphere/.env` to exist. Configure the Jenkins job to check out the repo and ensure Docker Compose is available to its agent.

## Stable address
The default Compose setup uses port 8080. EC2 public IP may change after stop/start. An Elastic IP or DNS name can provide a stable address but may incur charges. Do not allocate one unless needed and priced.
