-- USER PORTFOLIO
CREATE TABLE IF NOT EXISTS user_portfolios (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id SERIAL PRIMARY KEY,
  portfolio_id INT REFERENCES user_portfolios(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  quantity INT,
  avg_buy_price NUMERIC,
  UNIQUE (portfolio_id, ticker)
);

-- WATCHLIST
CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT DEFAULT 'My Watchlist',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id SERIAL PRIMARY KEY,
  watchlist_id INT REFERENCES watchlists(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  UNIQUE (watchlist_id, ticker)
);

-- ALERT SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  ticker TEXT NOT NULL,
  rule JSONB NOT NULL,
  status TEXT DEFAULT 'active',
  evaluation_frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMP DEFAULT NOW()
);
