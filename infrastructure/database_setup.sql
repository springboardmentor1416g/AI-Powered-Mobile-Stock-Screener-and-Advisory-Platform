-- Database provisioning for AI-Powered Stock Screener

-- Development DB
CREATE DATABASE stock_screener_dev;

-- Staging DB
CREATE DATABASE stock_screener_staging;

-- Production DB
CREATE DATABASE stock_screener_prod;

-- Example roles (simplified)
CREATE ROLE stock_app_user LOGIN PASSWORD 'change_me';
GRANT CONNECT ON DATABASE stock_screener_dev TO stock_app_user;
GRANT CONNECT ON DATABASE stock_screener_staging TO stock_app_user;
GRANT CONNECT ON DATABASE stock_screener_prod TO stock_app_user;
