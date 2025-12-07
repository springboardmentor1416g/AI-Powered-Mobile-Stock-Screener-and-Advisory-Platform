# CI/CD & Environment Setup — Submission
**Project:** AI-Powered Mobile Stock Screener & Advisory Platform  
**File:** /docs/cicd_environment_setup.md  
**Date:** 2025-12-07

---

## 1. Purpose
This document describes how CI/CD is organized for the project, how environments (dev / staging / prod) are provisioned, where secrets live, and exactly how to run the pipelines and deploy the backend and frontend for testing and production.

Keep this file in `/docs/` and link it from your project README.

---

## 2. Environments & Purpose
- **development (dev)** — Local developer and integration testing. Lightweight resources, simplified auth, uses sample data.
- **staging** — Pre-production mirror; same config as production but smaller instances. Used for QA and release validation.
- **production (prod)** — Live environment with hardened security, backups, monitoring and rollback procedures.

Each environment MUST have:
- Separate database instance (`stock_screener_dev`, `_staging`, `_prod`)
- Separate credentials & secrets
- Separate object storage / buckets for artifacts and backups
- CI/CD pipelines configured to deploy only to the target environment

---

## 3. CI Pipelines (GitHub Actions)
Pipeline files are located at `.github/workflows/`:

- `backend-ci.yml` — Runs on push/PR to `main` and `develop`:
  - Checkout, install, lint, unit tests, build
  - Optional Docker login (reads secrets)
  - Build & push Docker image to registry
  - Upload build artifact

- `frontend-ci.yml` — Runs on push/PR to `main` and `develop`:
  - Checkout, install, lint, unit tests
  - Placeholder Android APK build (CI-friendly)
  - Upload APK artifact

**How to trigger**  
Push to `develop` for staging deployments; merge to `main` for production deployments (CD configured separately).

---

## 4. Continuous Deployment (CD) - recommended patterns
We recommend using one of:
- GitHub Actions for CD (extend backend-ci to run deploy job)
- GitLab CI/CD or Argo CD if you use Kubernetes
- Terraform + CI runner to apply infra changes

**Recommended CD flow (simple):**
1. Build image in CI and push to registry.
2. Run smoke tests on staging:
   - Deploy image to staging (via Docker Compose / ECS / Kubernetes).
   - Run quick health checks.
3. After QA, promote image to production:
   - Deploy same image SHA to prod.
   - Run smoke tests and monitoring checks.

**Deployment methods:**
- Docker Compose (dev & small staging)
- Kubernetes / EKS / GKE / AKS for production (supports rollbacks & scaling)
- ECS/Fargate for simpler container hosting

---

## 5. Secrets & Environment Variables
**Local dev**  
- Use `.env.sample` files for templates (`/backend/.env.sample`, `/frontend/.env.sample`). Do **not** commit real secrets.

**Staging / Production**  
- Use a secret manager: AWS Secrets Manager / HashiCorp Vault / GCP Secret Manager.
- Store: `DATABASE_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `API_KEYS_MARKETDATA`, `DOCKER_REGISTRY` credentials, Sentry DSN.
- In GitHub Actions, add required secrets under repository Settings → Secrets (or use organization-level secrets).

**Env var names (examples)**
```
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DATABASE_URL
JWT_SECRET
API_KEYS_MARKETDATA
DOCKER_REGISTRY
DOCKER_USERNAME
DOCKER_PASSWORD
```

---

## 6. Database Migrations & Versioning
- Use a migration tool (Flyway, Alembic, Liquibase, or plain SQL with ordered files).
- Migration files live in `/backend/database/migrations/` (e.g., `V1__init_schema.sql`).
- CI/CD should run migrations on the target environment before starting the new app container (or during a maintenance window).
- Recommended: Run migrations using a dedicated service account (migrator) with limited privileges.

**Example CI step (pseudo)**
```yaml
- name: Run DB migrations (staging)
  run: flyway -url=$DATABASE_URL -locations=filesystem:backend/database/migrations migrate
  env:
    DATABASE_URL: ${ secrets.STAGING_DATABASE_URL }
```

---

## 7. Deployment Steps (example — staging)
1. Merge feature branch → `develop`.
2. CI builds image and pushes to registry.
3. CI triggers deploy job:
   - Pull image, run migrations on staging DB using `screener_migrator`.
   - Deploy container to staging host (docker-compose, ECS task, or k8s deployment).
   - Run smoke tests: health endpoint, basic screener query, sample data check.
4. Notify team and run manual QA.
5. Promote to `main` to trigger production flow.

---

## 8. Rollback & Recovery
- **Rollback image**: Re-deploy previous image SHA from registry.
- **Rollback DB schema**: Complex — prefer non-destructive migrations. If destructive changes are required, run them in a maintenance window and have a backup restore plan.
- **Backup policy**: Daily snapshots + PITR where supported. Keep weekly full dumps for 90 days.

---

## 9. Testing Strategy in CI
- **Unit tests**: Run on every PR.
- **Integration tests**: Run on PR merge to `develop` against a temporary DB instance (use GitHub Actions service or test container).
- **End-to-end tests**: Run in staging after deploy (smoke tests).
- **Performance tests**: Run separately, not on every push (schedule nightly).

---

## 10. Monitoring & Alerting (Ops)
- Monitor using Prometheus + Grafana or cloud provider's monitoring.
- Important metrics:
  - DB CPU, Disk usage, Connection count
  - Query latency and slow queries
  - Hypertable chunk count / size
  - Ingestion job success/fail rates
- Alerts:
  - Disk > 80%
  - Replication lag > threshold
  - Failed backups
  - Error rates increase in application logs

---

## 11. CI Permissions & Security
- Use short-lived credentials for CI where possible (OIDC with cloud provider).
- Limit GitHub Actions secrets access: use environment protection rules for production.
- Approve deployments to production via manual approval step in GitHub Actions.

---

## 12. Example GitHub Actions Secrets (what to add)
- `STAGING_DATABASE_URL`
- `PROD_DATABASE_URL`
- `DOCKER_REGISTRY`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `JWT_SECRET`
- `MARKETDATA_API_KEY`

---

## 13. Troubleshooting & Common Issues
- **Build fails on CI**: check node/npm versions and cache. Re-run with `--verbose` logs.
- **Migrations fail**: ensure migrator user has correct privileges and migrations are idempotent.
- **DB connection errors**: ensure security group/firewall allows CI runner IPs or use runner inside VPC.

---

## 14. Quick checklist (copy into PR)
- [ ] `.github/workflows/backend-ci.yml` present and runs on PRs
- [ ] `.github/workflows/frontend-ci.yml` present and runs on PRs
- [ ] Migration files in `/backend/database/migrations/`
- [ ] Secrets added to repo settings for staging/prod
- [ ] Dev/staging/prod DB endpoints prepared and accessible
- [ ] Sample data loader tested locally via docker-compose

---

## 15. Where to find files in repo
- CI workflows: `.github/workflows/`
- Schema & migrations: `/backend/database/`
- Env samples: `/backend/.env.sample`, `/frontend/.env.sample`
- Infra provisioning script: `/infrastructure/database_setup.sql`
- Performance plan: `/docs/performance_optimization.md`

---

*End of CI/CD & Environment Setup guide — maintainers: Team*
