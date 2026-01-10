-- User Portfolios
CREATE TABLE user_portfolios (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio Holdings
CREATE TABLE portfolio_holdings (
    id UUID PRIMARY KEY,
    portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    avg_buy_price DECIMAL(10,2),
    UNIQUE (portfolio_id, stock_symbol)
);

-- Watchlists
CREATE TABLE watchlists (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist Items
CREATE TABLE watchlist_items (
    id UUID PRIMARY KEY,
    watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(20) NOT NULL,
    UNIQUE (watchlist_id, stock_symbol)
);

-- Alert Subscriptions
CREATE TABLE alert_subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    stock_symbol VARCHAR(20),
    condition JSONB NOT NULL,
    frequency VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
