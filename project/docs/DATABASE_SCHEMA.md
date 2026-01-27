# Database Schema Documentation

## Overview

The Stock Screener platform uses PostgreSQL 16+ with the following core tables and relationships.

## Core Tables

### users
User account information and authentication.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `idx_users_email` - Email lookup
- `idx_users_is_active` - Active users filter

---

### companies
Stock metadata and company information.

```sql
CREATE TABLE companies (
  company_id SERIAL PRIMARY KEY,
  ticker VARCHAR(20) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sector VARCHAR(100),
  industry VARCHAR(100),
  exchange VARCHAR(50),
  currency VARCHAR(10),
  country VARCHAR(50),
  type VARCHAR(50),
  market_cap BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `idx_companies_ticker` - Symbol lookup
- `idx_companies_sector` - Sector filtering
- `idx_companies_exchange` - Exchange filtering
- `idx_companies_country` - Country filtering

**Relationships:**
- Referenced by `price_history`
- Referenced by `fundamentals_quarterly`
- Referenced by `technical_indicators_latest`

---

### price_history
Daily OHLCV historical data.

```sql
CREATE TABLE price_history (
  time TIMESTAMP NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  open NUMERIC(12,4),
  high NUMERIC(12,4),
  low NUMERIC(12,4),
  close NUMERIC(12,4),
  volume BIGINT,
  PRIMARY KEY (time, ticker)
);
```

**Indexes:**
- `idx_price_history_ticker_time` - Time series queries

---

### price_intraday
Intraday OHLCV data (minute/hourly).

```sql
CREATE TABLE price_intraday (
  time TIMESTAMP NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  open NUMERIC(12,4),
  high NUMERIC(12,4),
  low NUMERIC(12,4),
  close NUMERIC(12,4),
  volume BIGINT,
  PRIMARY KEY (time, ticker)
);
```

---

### fundamentals_quarterly
Financial metrics (quarterly).

```sql
CREATE TABLE fundamentals_quarterly (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,
  quarter VARCHAR(10) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  fiscal_date DATE,
  revenue BIGINT,
  net_income BIGINT,
  eps NUMERIC(12,4),
  FOREIGN KEY (ticker) REFERENCES companies(ticker)
);
```

---

### latest_fundamentals
Materialized view of latest fundamental metrics.

**Contains:**
- `ticker`, `pe_ratio`, `pb_ratio`, `peg_ratio`, `ps_ratio`
- `roe`, `roa`, `operating_margin`, `profit_margin`
- `eps`, `revenue`, `net_income`
- `updated_at`

---

### technical_indicators_latest
Latest technical indicator values.

```sql
CREATE TABLE technical_indicators_latest (
  ticker VARCHAR(20) PRIMARY KEY,
  rsi_14 NUMERIC(6,2),
  sma_20 NUMERIC(12,4),
  sma_50 NUMERIC(12,4),
  sma_200 NUMERIC(12,4),
  ret_1m NUMERIC(8,4),
  ret_3m NUMERIC(8,4),
  ret_6m NUMERIC(8,4),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### user_portfolios
User portfolio tracking.

```sql
CREATE TABLE user_portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_portfolios_user_id` - User lookups
- `idx_portfolios_is_active` - Active filter

---

### portfolio_positions
Individual positions within portfolios.

```sql
CREATE TABLE portfolio_positions (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  quantity NUMERIC(18,6) NOT NULL,
  entry_price NUMERIC(18,4) NOT NULL,
  entry_date DATE NOT NULL,
  exit_price NUMERIC(18,4),
  exit_date DATE,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (portfolio_id) REFERENCES user_portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE RESTRICT
);
```

**Indexes:**
- `idx_positions_portfolio_id` - Portfolio lookups
- `idx_positions_ticker` - Stock lookups
- `idx_positions_status` - Status filtering

---

### watchlists
User watchlist collections.

```sql
CREATE TABLE watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### watchlist_items
Stocks within watchlists.

```sql
CREATE TABLE watchlist_items (
  id SERIAL PRIMARY KEY,
  watchlist_id INTEGER NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(watchlist_id, ticker),
  FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE,
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE RESTRICT
);
```

---

### saved_screens
User-saved screening queries.

```sql
CREATE TABLE saved_screens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  filter_dsl JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### screener_history
Historical record of screening queries.

```sql
CREATE TABLE screener_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  filter_dsl JSONB NOT NULL,
  result_count INTEGER,
  execution_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### alert_subscriptions
User alert subscriptions.

```sql
CREATE TABLE alert_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  ticker VARCHAR(20),
  alert_type VARCHAR(50) NOT NULL,
  condition_dsl JSONB NOT NULL,
  frequency VARCHAR(50) DEFAULT 'daily',
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE SET NULL
);
```

---

## Materialized Views

### stock_summary
Comprehensive stock data view combining multiple tables.

**Refreshed:** On demand or scheduled

**Contains:**
- Company data
- Latest price
- Latest fundamentals
- Technical indicators
- Portfolio position info (if applicable)

---

### latest_prices
Latest price data for all stocks.

```sql
SELECT DISTINCT ON (ticker)
  ticker,
  close as last_price,
  volume,
  datetime as last_updated
FROM price_history
ORDER BY ticker, datetime DESC;
```

---

## Field Mappings (DSL Parser)

### Numeric Fields
- `price`, `close` → `lp.last_price`
- `volume` → `lp.volume`
- `market_cap` → `c.market_cap`
- `pe_ratio`, `pe` → `lf.pe_ratio`
- `pb_ratio`, `pb` → `lf.pb_ratio`
- `peg_ratio`, `peg` → `lf.peg_ratio`
- `ps_ratio`, `ps` → `lf.ps_ratio`
- `roe` → `lf.roe`
- `roa` → `lf.roa`
- `operating_margin` → `lf.operating_margin`
- `profit_margin` → `lf.profit_margin`
- `eps` → `lf.eps`
- `revenue` → `lf.revenue`
- `net_income` → `lf.net_income`

### Technical Fields
- `rsi`, `rsi14` → `ti.rsi_14`
- `sma20` → `ti.sma_20`
- `sma50` → `ti.sma_50`
- `sma200` → `ti.sma_200`
- `ret_1m`, `ret_3m`, `ret_6m` → `ti.ret_1m/3m/6m`

### String Fields
- `sector` → `c.sector`
- `industry` → `c.industry`
- `exchange` → `c.exchange`
- `country` → `c.country`
- `ticker` → `c.ticker`
- `name` → `c.name`

---

## Query Examples

### Get all tech stocks with PE < 20
```sql
SELECT *
FROM companies c
LEFT JOIN latest_prices lp ON c.ticker = lp.ticker
LEFT JOIN latest_fundamentals lf ON c.ticker = lf.ticker
WHERE c.sector = 'Technology'
AND lf.pe_ratio < 20
ORDER BY lf.pe_ratio ASC
LIMIT 100;
```

### Get user portfolio performance
```sql
SELECT 
  p.name,
  COUNT(pp.id) as position_count,
  SUM(pp.quantity * lp.last_price) as current_value,
  SUM(pp.quantity * pp.entry_price) as total_cost,
  (SUM(pp.quantity * lp.last_price) - SUM(pp.quantity * pp.entry_price)) as unrealized_gain
FROM user_portfolios p
LEFT JOIN portfolio_positions pp ON p.id = pp.portfolio_id
LEFT JOIN latest_prices lp ON pp.ticker = lp.ticker
WHERE p.user_id = $1 AND pp.status = 'open'
GROUP BY p.id, p.name;
```

---

## Indexes Strategy

**High-Priority Indexes:**
- `users.email` - Authentication lookups
- `companies.ticker` - Stock lookups
- `price_history(ticker, time DESC)` - Time series queries
- `portfolio_positions(portfolio_id, status)` - Portfolio performance
- `alert_subscriptions(user_id, is_active)` - Active alerts

**Performance Considerations:**
- Use LIMIT in screener queries (max 1000)
- VACUUM ANALYZE after data loads
- Monitor query execution with pg_stat_statements
- Materialize frequently accessed views

---

*Last Updated: January 27, 2024*
