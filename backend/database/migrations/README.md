<!-- Command to run migrations -->

psql -d stock_screener -f V1__initial_schema.sql
psql -d stock_screener -f V2__alter_price_history_time.sql
psql -d stock_screener -f V3__add_indexes.sql