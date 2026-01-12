-- Analyst Estimates
CREATE TABLE IF NOT EXISTS analyst_estimates (
  id SERIAL PRIMARY KEY,
  ticker TEXT REFERENCES companies(ticker),
  eps_estimate NUMERIC,
  revenue_estimate NUMERIC,
  analyst_count INT,
  revision_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Price Targets
CREATE TABLE IF NOT EXISTS price_targets (
  id SERIAL PRIMARY KEY,
  ticker TEXT REFERENCES companies(ticker),
  target_low NUMERIC,
  target_avg NUMERIC,
  target_high NUMERIC,
  analyst_count INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Buyback Announcements
CREATE TABLE IF NOT EXISTS buyback_announcements (
  id SERIAL PRIMARY KEY,
  ticker TEXT REFERENCES companies(ticker),
  announcement_date DATE,
  buyback_type TEXT,
  amount NUMERIC,
  price_range TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Earnings Calendar
CREATE TABLE IF NOT EXISTS earnings_calendar (
  id SERIAL PRIMARY KEY,
  ticker TEXT REFERENCES companies(ticker),
  earnings_date DATE,
  fiscal_quarter TEXT,
  fiscal_year INT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
