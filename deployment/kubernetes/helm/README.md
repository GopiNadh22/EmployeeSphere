# Helm

Install with:
```bash
helm lint deployment/kubernetes/helm/employeesphere
helm template employeesphere deployment/kubernetes/helm/employeesphere   --set database.password='YOUR_STRONG_PASSWORD'   --set database.secretKey='YOUR_RANDOM_SECRET'
```
For a cluster install, add `--install` and a release name to `helm upgrade --install`. Avoid putting real secrets in shell history in shared environments; use a secret manager or a protected values file outside Git. Images must exist and be pullable by the cluster.
