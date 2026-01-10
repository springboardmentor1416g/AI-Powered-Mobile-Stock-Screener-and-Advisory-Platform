CREATE DATABASE stock_screener_dev;
CREATE DATABASE stock_screener_staging;
CREATE DATABASE stock_screener_prod;

-- Example roles
CREATE ROLE dev_user LOGIN PASSWORD 'dev_pass';
CREATE ROLE staging_user LOGIN PASSWORD 'staging_pass';
CREATE ROLE prod_user LOGIN PASSWORD 'prod_pass';

GRANT ALL PRIVILEGES ON DATABASE stock_screener_dev TO dev_user;
GRANT ALL PRIVILEGES ON DATABASE stock_screener_staging TO staging_user;
GRANT ALL PRIVILEGES ON DATABASE stock_screener_prod TO prod_user;