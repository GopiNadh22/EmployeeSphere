# Kubernetes roadmap

Kubernetes is a future deployment target; Docker Compose remains the simplest local and EC2 deployment mode.

Before using Kubernetes:
- Publish backend and frontend images to a registry, or build/load them into a local cluster.
- Create Deployments, Services, ConfigMaps and Secrets.
- Add readiness/liveness probes and resource requests/limits.
- Use persistent storage or an external managed database for PostgreSQL.
- Configure Ingress and TLS.
- Package manifests with Helm.

For ₹0 learning, use kind or K3d locally. A Kubernetes cluster on AWS can incur compute and networking charges. Amazon EKS has separate control-plane charges; do not create EKS for this zero-budget project.
