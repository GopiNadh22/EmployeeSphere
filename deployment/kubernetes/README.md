# Kubernetes deployment (manifest templates)

These manifests are a starting point for a local kind/K3d cluster. They are not yet validated against a live cluster.

Prerequisites:
- A local Kubernetes cluster (kind or K3d)
- An Ingress controller (for example, ingress-nginx)
- Backend and frontend images built and loaded into the cluster or pushed to a registry
- A real Secret created locally from `base/secret.example.yaml`; never commit it

Before applying:
1. Replace the placeholder image names in `base/backend.yaml` and `base/frontend.yaml`.
2. Build/tag/load images into kind/K3d or push them to a registry.
3. Create the Secret securely, e.g. `kubectl apply -f /path/outside/git/employeesphere-secret.yaml`.
4. Ensure the cluster has a default StorageClass for the PostgreSQL PVC.
5. Install ingress-nginx and verify its service exposure.
6. Run `kubectl apply -k base/`.
7. Check `kubectl get pods,svc,ingress -n employeesphere`.

Cleanup: `kubectl delete namespace employeesphere` removes namespaced resources and the PVC. Depending on the StorageClass reclaim policy, the underlying PV may be retained or deleted. Back up data first.

The sample manifest uses a PostgreSQL PVC and one replica. It is for learning, not high-availability production. The backend image migration initContainer must have a valid database URL and credentials.
