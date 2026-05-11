CREATE DATABASE stock_screener_dev;   --dev database
CREATE DATABASE stock_screener_staging;    --staging database
CREATE DATABASE stock_screener_prod;    --prod database

-- Example roles
CREATE USER dev_user WITH PASSWORD 'dev_password';
CREATE USER staging_user WITH PASSWORD 'staging_password';
CREATE USER prod_user WITH PASSWORD 'prod_password';

GRANT ALL PRIVILEGES ON DATABASE stock_screener_dev TO dev_user;
GRANT ALL PRIVILEGES ON DATABASE stock_screener_staging TO staging_user;
GRANT ALL PRIVILEGES ON DATABASE stock_screener_prod TO prod_user;
