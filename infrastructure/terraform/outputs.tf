output "instance_id" {
  value       = aws_instance.employeesphere.id
  description = "EC2 instance ID"
}

output "public_ip" {
  value       = aws_instance.employeesphere.public_ip
  description = "Temporary public IPv4 address"
}

output "ssh_command" {
  value       = "ssh -i <your-key.pem> ubuntu@${aws_instance.employeesphere.public_ip}"
  description = "Replace <your-key.pem> with your local private key path."
}

output "application_url" {
  value       = "http://${aws_instance.employeesphere.public_ip}:${var.app_port}"
  description = "EmployeeSphere demo URL after deployment."
}
