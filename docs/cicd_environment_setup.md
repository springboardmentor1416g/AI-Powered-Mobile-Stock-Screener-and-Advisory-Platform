# CI/CD & Environment Setup

## Environments
- Dev: Local + Docker
- Staging: CI deployed environment
- Prod: Secure production deployment

## CI/CD
- GitHub Actions runs on every push
- Backend and frontend pipelines separated
- Docker used for build consistency

## Secrets
- Stored in GitHub Actions Secrets
- Never committed to repo

## Databases
- Separate database per environment
- No shared credentials
