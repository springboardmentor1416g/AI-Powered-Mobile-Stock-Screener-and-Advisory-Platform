-- Database setup script for dev, staging, and prod environments

-- Run these as a superuser on your PostgreSQL server

-- Development database
CREATE DATABASE stock_screener_dev;

-- Staging database
CREATE DATABASE stock_screener_staging;

-- Production database
CREATE DATABASE stock_screener_prod;

-- Example: create a common user (adjust password in real setup)
CREATE USER stock_user WITH PASSWORD 'changeme';

GRANT ALL PRIVILEGES ON DATABASE stock_screener_dev TO stock_user;
GRANT ALL PRIVILEGES ON DATABASE stock_screener_staging TO stock_user;
GRANT ALL PRIVILEGES ON DATABASE stock_screener_prod TO stock_user;
