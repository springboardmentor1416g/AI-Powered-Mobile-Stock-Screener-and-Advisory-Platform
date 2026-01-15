# Infrastructure Provisioning

## Local Development
- Docker Compose
- PostgreSQL + TimescaleDB
- Manual startup

## Cloud Provisioning
- Terraform used for infra as code
- Separate state per environment
- Private networking
- TLS enforced

## Principles
- One DB per environment
- No shared credentials
- No public DB access
