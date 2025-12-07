-- database_setup.sql
-- Provisioning script for development, staging, and production PostgreSQL databases (with TimescaleDB)
-- NOTE: This script contains SQL and psql commands. Run as a superuser (postgres) or adapt to your environment.
-- Usage examples (run from shell):
--   sudo -u postgres psql -f infrastructure/database_setup.sql
-- or run step-by-step commands shown in this file.

-------------------------------------------------------------------------------
-- VARIABLES (replace with your values or export as env vars before running)
-------------------------------------------------------------------------------
-- Example env variables you can export in shell before running:
-- export DEV_DB_USER=screener_dev_admin
-- export DEV_DB_PASS=change_me_dev
-- export STAGE_DB_USER=screener_stage_admin
-- export STAGE_DB_PASS=change_me_stage
-- export PROD_DB_USER=screener_prod_admin
-- export PROD_DB_PASS=change_me_prod
-- export ANALYTICS_USER=analytics_readonly
-- export ANALYTICS_PASS=analytics_readonly_pass
-- export SUPERUSER=postgres

-------------------------------------------------------------------------------
-- 1) Create databases (dev, staging, prod)
-------------------------------------------------------------------------------
-- Run these commands as a DB superuser, e.g., sudo -u postgres psql -c "CREATE DATABASE ..."

-- Development DB
-- sudo -u postgres psql -c "CREATE DATABASE stock_screener_dev OWNER postgres;"
-- Staging DB
-- sudo -u postgres psql -c "CREATE DATABASE stock_screener_staging OWNER postgres;"
-- Production DB
-- sudo -u postgres psql -c "CREATE DATABASE stock_screener_prod OWNER postgres;"

-------------------------------------------------------------------------------
-- 2) Create environment-specific roles/users and grant privileges
-------------------------------------------------------------------------------
-- Example: create roles for each environment and an analytics read-only role.
-- Run as postgres superuser (psql -U postgres -d postgres)

-- Development role
CREATE ROLE IF NOT EXISTS screener_dev_admin LOGIN PASSWORD 'change_me_dev';
GRANT CONNECT ON DATABASE stock_screener_dev TO screener_dev_admin;

-- Staging role
CREATE ROLE IF NOT EXISTS screener_stage_admin LOGIN PASSWORD 'change_me_stage';
GRANT CONNECT ON DATABASE stock_screener_staging TO screener_stage_admin;

-- Production role
CREATE ROLE IF NOT EXISTS screener_prod_admin LOGIN PASSWORD 'change_me_prod';
GRANT CONNECT ON DATABASE stock_screener_prod TO screener_prod_admin;

-- Analytics read-only role
CREATE ROLE IF NOT EXISTS analytics_readonly LOGIN PASSWORD 'analytics_readonly_pass';
-- Grant CONNECT; table-level SELECT grants to be applied in each DB after migrations are run.

-------------------------------------------------------------------------------
-- 3) Enable TimescaleDB extension in each database
-------------------------------------------------------------------------------
-- The extension must be created in each database separately. Example commands (run per DB):
-- sudo -u postgres psql -d stock_screener_dev -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
-- sudo -u postgres psql -d stock_screener_staging -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
-- sudo -u postgres psql -d stock_screener_prod -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"

-------------------------------------------------------------------------------
-- 4) Grant schema/table privileges (example pattern)
-------------------------------------------------------------------------------
-- After running migrations in each DB, grant analytics_readonly SELECT on all tables:
-- sudo -u postgres psql -d stock_screener_prod -c "GRANT USAGE ON SCHEMA public TO analytics_readonly;"
-- sudo -u postgres psql -d stock_screener_prod -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;"
-- Also set default privileges for future tables:
-- sudo -u postgres psql -d stock_screener_prod -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analytics_readonly;"

-- For admin roles (screener_prod_admin), grant the ability to create objects in the DB (optional / carefully in prod)
-- sudo -u postgres psql -d stock_screener_prod -c "GRANT CREATE, CONNECT ON DATABASE stock_screener_prod TO screener_prod_admin;"

-------------------------------------------------------------------------------
-- 5) Example: create a maintenance/schema user for running migrations (optional)
-------------------------------------------------------------------------------
CREATE ROLE IF NOT EXISTS screener_migrator LOGIN PASSWORD 'migrator_pass';
GRANT CONNECT ON DATABASE stock_screener_dev TO screener_migrator;
GRANT CONNECT ON DATABASE stock_screener_staging TO screener_migrator;
GRANT CONNECT ON DATABASE stock_screener_prod TO screener_migrator;

-------------------------------------------------------------------------------
-- 6) Backup directory and example pg_dump commands (documented here)
-------------------------------------------------------------------------------
-- Full dump (custom format)
-- pg_dump -h <host> -U <user> -Fc -f /backups/stock_screener_dev_$(date +%F).dump stock_screener_dev
-- Restore
-- pg_restore -h <host> -U <user> -d stock_screener_dev /backups/stock_screener_dev_2025-12-01.dump

-------------------------------------------------------------------------------
-- 7) Notes for cloud providers & Terraform integration
-------------------------------------------------------------------------------
-- When provisioning managed Postgres (Amazon RDS / Aurora, Google Cloud SQL, Azure Database for PostgreSQL):
-- - Create DB instances in private subnets with security groups limiting access to app servers / CI runners.
-- - Use provider-managed backups & snapshots and enable PITR if available.
-- - Store DB credentials in a secrets manager and reference them in Terraform outputs instead of raw passwords in code.
-- - For RDS, you may need to enable the pglogical extension or use read replicas for heavy analytical workloads.

-------------------------------------------------------------------------------
-- End of database_setup.sql
-------------------------------------------------------------------------------
