-- 1. Create Portfolio Table
CREATE TABLE public.portfolios (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Main Portfolio',
    created_at TIMESTAMP DEFAULT now()
);

-- 2. Create Portfolio Holdings (The stocks inside the portfolio)
CREATE TABLE public.portfolio_holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    ticker VARCHAR(10) REFERENCES companies(ticker),
    quantity NUMERIC DEFAULT 0,
    avg_buy_price NUMERIC DEFAULT 0,
    added_at TIMESTAMP DEFAULT now(),
    UNIQUE(portfolio_id, ticker)
);

-- 3. Create Watchlists
CREATE TABLE public.watchlists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Watchlist',
    created_at TIMESTAMP DEFAULT now()
);

-- 4. Create Watchlist Items
CREATE TABLE public.watchlist_items (
    id SERIAL PRIMARY KEY,
    watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
    ticker VARCHAR(10) REFERENCES companies(ticker),
    added_at TIMESTAMP DEFAULT now(),
    UNIQUE(watchlist_id, ticker)
);

-- 5. Create Alerts (for future use)
CREATE TABLE public.alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(10) REFERENCES companies(ticker),
    condition_type VARCHAR(50), -- e.g., 'PRICE_ABOVE', 'PRICE_BELOW'
    threshold_value NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now()
);