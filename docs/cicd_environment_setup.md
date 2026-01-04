<<<<<<< HEAD
# CI/CD & Environment Provisioning

This document describes the CI/CD pipeline and environment setup
for the AI-Powered Mobile Stock Screener platform.

## Environments
- Development: Local database and testing
- Staging: CI deployed backend for QA
- Production: Hardened production deployment

## CI/CD Pipelines
- Backend CI with GitHub Actions
- Frontend CI for mobile builds
- Docker based deployment strategy

## Secrets Management
Secrets are stored using GitHub Actions Secrets.
Environment-specific variables are configured separately.
=======
# CI/CD & Environment Setup Summary

This document explains how CI/CD and environments are organized for the AI-Powered Stock Screener project.

## Environments

- Development (dev): local environment using docker-compose and a local PostgreSQL/TimescaleDB instance.
- Staging: cloud-hosted environment used for testing before production.
- Production: live environment with stricter security, backups and monitoring.

## CI/CD Pipelines (GitHub Actions)

- Backend pipeline: .github/workflows/backend-ci.yml
  - Runs on push/PR to main
  - Installs backend dependencies
  - Runs tests (when implemented)
  - Placeholder steps for building Docker image

- Frontend pipeline: .github/workflows/frontend-ci.yml
  - Runs on push/PR to main
  - Installs frontend dependencies
  - Runs tests (when implemented)
  - Placeholder for building mobile app artifacts

## Environment Configuration

- Backend env example: backend/.env.sample
- Frontend env example: frontend/.env.sample

Each real environment (dev, staging, prod) will have its own actual .env, secrets, and database URLs.

## Database Provisioning

- infrastructure/database_setup.sql contains the SQL to create:
  - stock_screener_dev
  - stock_screener_staging
  - stock_screener_prod

## Next Steps (Future Work)

- Hook up real tests and build steps in CI
- Add Docker build and push to container registry
- Set up real cloud databases and secrets manager
- Enable deployment jobs to staging and production
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
