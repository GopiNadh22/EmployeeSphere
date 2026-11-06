resource "aws_security_group" "employeesphere" {
  name        = "${var.project_name}-demo-sg"
  description = "Temporary EmployeeSphere demo access"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH restricted to the operator's IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  ingress {
    description = "EmployeeSphere web application"
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name      = "${var.project_name}-demo-sg"
    Project   = "EmployeeSphere"
    ManagedBy = "Terraform"
  }
}

resource "aws_instance" "employeesphere" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.employeesphere.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = var.root_volume_gb
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  user_data = <<-EOF
    #!/bin/bash
    set -eux
    apt-get update
    apt-get install -y python3 python3-pip
  EOF

  tags = {
    Name      = "${var.project_name}-demo"
    Project   = "EmployeeSphere"
    ManagedBy = "Terraform"
  }
}
