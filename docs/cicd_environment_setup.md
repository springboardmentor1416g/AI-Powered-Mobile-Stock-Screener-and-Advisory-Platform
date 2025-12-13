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
