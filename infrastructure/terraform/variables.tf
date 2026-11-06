variable "aws_region" {
  description = "AWS region for the temporary demonstration environment."
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "Choose only after checking current regional pricing and account eligibility."
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Name of an existing EC2 key pair in the selected region."
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "Your public IP in CIDR notation, e.g. 203.0.113.10/32. Never use 0.0.0.0/0 for SSH."
  type        = string
}

variable "app_port" {
  description = "Host port exposed by the Compose frontend."
  type        = number
  default     = 8080
}

variable "project_name" {
  type    = string
  default = "employeesphere"
}

variable "root_volume_gb" {
  type    = number
  default = 20
}
