-- USER PORTFOLIO
CREATE TABLE user_portfolios (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portfolio_holdings (
    id UUID PRIMARY KEY,
    portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    avg_buy_price DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (portfolio_id, stock_symbol)
);

-- WATCHLIST
CREATE TABLE watchlists (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE watchlist_items (
    id UUID PRIMARY KEY,
    watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (watchlist_id, stock_symbol)
);

-- ALERT SUBSCRIPTIONS
CREATE TABLE alert_subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    stock_symbol VARCHAR(20),
    alert_type VARCHAR(30) NOT NULL, -- PRICE | FUNDAMENTAL | EVENT
    condition JSONB NOT NULL,
    frequency VARCHAR(20) DEFAULT 'daily',
    status VARCHAR(20) DEFAULT 'active',
    last_triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
