# Manual cleanup and cost verification

1. Save any required database backup and test reports first.
2. From the deployment directory, run `docker compose down` to stop/remove containers and network. This preserves the named database volume.
3. If the database is intentionally disposable, review the consequences and then run `docker compose down -v` to remove the volume. This permanently deletes the local/EC2 database data.
4. If EC2 was created manually, terminate it in the AWS console. If created by Terraform, inspect `terraform plan -destroy`, verify the account/region/workspace/state, then run `terraform destroy` and type `yes` only after review.
5. Separately inspect and remove only resources created for this deployment: EBS volumes/snapshots, Elastic IPs, load balancers, NAT gateways, security groups, log groups and other billable resources. Do not delete shared/default VPC resources.
6. Verify the EC2 instance is terminated and check AWS Billing/Cost Explorer. Billing data can be delayed.

This cleanup does not delete GitHub source code, Dockerfiles, Jenkinsfile, Terraform configuration, Kubernetes manifests or documentation. Keep Terraform state until destroy completes. Never commit state files or credentials.
