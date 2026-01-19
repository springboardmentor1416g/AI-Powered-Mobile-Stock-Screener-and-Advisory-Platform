# Configuration & Secrets Management

## Local (dev)
- .env files
- Environment variables

Example:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stock_screener

## Staging / Production
- Secrets Manager
- No secrets committed to Git
- Credentials rotated periodically

## Naming Conventions
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
