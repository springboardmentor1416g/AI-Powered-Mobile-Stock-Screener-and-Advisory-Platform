# Infrastructure Provisioning

## Local Development
- Docker Compose used to provision:
  - PostgreSQL + TimescaleDB
  - Sample data loader

## Cloud Environments (Staging / Production)
- Provisioned using Terraform
- Separate state per environment
- Database deployed in private subnet
- TLS enforced for all connections

## CI/CD Integration
- Migrations executed before app deployment
- Environment-specific variables injected at runtime
