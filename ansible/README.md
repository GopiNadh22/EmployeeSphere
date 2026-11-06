# Ansible

Install Ansible on your control machine and install the Docker collection:
```bash
python3 -m pip install --user ansible
ansible-galaxy collection install -r requirements.yml
cp inventory/hosts.ini.example inventory/hosts.ini
# Edit IP and private-key path.
ansible-playbook playbooks/install-docker.yml
```

Before deploying, clone the repository on the host or run the deploy playbook after replacing `repository_url`. Create `/opt/employeesphere/.env` securely on the host with the values from `.env.example`; never commit it. Then:
```bash
ansible-playbook playbooks/deploy-employeesphere.yml
```

The `docker` group grants effectively root-equivalent privileges. Only grant it to trusted deployment users. Verify the Docker collection module and Ansible versions on your controller before running.
