-- Development Database
CREATE DATABASE stock_screener_dev;
CREATE USER dev_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE stock_screener_dev TO dev_user;

-- Staging Database
CREATE DATABASE stock_screener_staging;
CREATE USER staging_user WITH PASSWORD 'staging_password';
GRANT ALL PRIVILEGES ON DATABASE stock_screener_staging TO staging_user;

-- Production Database
CREATE DATABASE stock_screener_prod;
CREATE USER prod_user WITH PASSWORD 'prod_password';
GRANT CONNECT ON DATABASE stock_screener_prod TO prod_user;
-- Additional restrictions and roles for production recommended.
