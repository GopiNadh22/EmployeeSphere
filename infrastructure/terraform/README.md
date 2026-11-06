# Terraform — temporary EC2 demonstration host

## Cost warning
Terraform is free to use, but EC2 compute, EBS storage, public IPv4, data transfer and other AWS resources may cost money. A `t3.small` is a starting example, NOT a promise of free eligibility. Check AWS Pricing Calculator, your account credits and Free Tier terms before applying. For strict ₹0, do not run `terraform apply`; use local Docker and local Kubernetes.

## Prerequisites
- Terraform CLI
- AWS CLI configured for the intended account (`aws sts get-caller-identity`)
- Existing EC2 key pair in the selected region
- Your public IPv4 CIDR (for example, `x.x.x.x/32`)

## Create
```bash
cp terraform.tfvars.example terraform.tfvars
# Edit key_name and ssh_allowed_cidr; choose an instance only after checking costs.
terraform init
terraform fmt -recursive
terraform validate
terraform plan
# Review every resource and estimated cost before proceeding:
terraform apply
```

## Destroy manually
```bash
terraform plan -destroy
# Confirm account, region, workspace, and resources in the plan.
terraform destroy
```

Do not delete Terraform state until destroy has completed. The default VPC/subnets are data sources and are not destroyed. The instance's root EBS volume is configured for deletion on termination. Check AWS console/Billing after destruction for any separately created resources. No Elastic IP, NAT Gateway, load balancer, EKS cluster or RDS database is created by this configuration.
