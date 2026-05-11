## API -> Source mapping

### Exchange

| Field         | Source                |
| ------------- | --------------------- |
| code          | Exchange Metadata API |
| name          | Exchange Metadata API |
| timezone      | Exchange Metadata API |
| trading_hours | Exchange Metadata API |

### sector

| Field          | Source              |
| -------------- | ------------------- |
| name           | Market Metadata API |
| industry_group | Market Metadata API |

### Stocks

| Field        | Source                       |
| ------------ | ---------------------------- |
| symbol       | Market Listings API          |
| company_name | Market Listings API          |
| exchange_id  | Market Listings API          |
| sector_id    | Market Metadata API          |
| market_cap   | Fundamentals API / Quote API |
| listing_date | Market Listings API          |
| currency     | Market Listings API          |
| active       | Internal Flag                |

### PriceHistory (OHLCV)
| Field                     | Source              |
| ------------------------- | ------------------- |
| open / high / low / close | Market Price API    |
| adj_close                 | Market Price API    |
| volume                    | Market Price API    |
| ts                        | Price API timestamp |

### Financials (Quarterly/Annual)

| Field                            | Source                 |
| -------------------------------- | ---------------------- |
| revenue                          | Fundamentals API       |
| ebitda                           | Fundamentals API       |
| net_income                       | Fundamentals API       |
| eps                              | Earnings API           |
| free_cash_flow                   | Fundamentals API       |
| total_debt                       | Fundamentals API       |
| pe_ratio                         | Internal (price / EPS) |
| peg_ratio                        | Internal (PE / growth) |
| period_start / period_end / type | Fundamentals API       |

### Analyst Estimates

| Field         | Source                      |
| ------------- | --------------------------- |
| analyst_name  | Analyst API                 |
| rating        | Analyst Ratings API         |
| target_low    | Analyst Price Target API    |
| target_mid    | Analyst Price Target API    |
| target_high   | Analyst Price Target API    |
| estimate_date | Analyst API                 |
| source        | Analyst API                 |
| raw           | Analyst API (JSON snapshot) |

### Earnings Calendar

| Field              | Source                                  |
| ------------------ | --------------------------------------- |
| scheduled_date     | Earnings Calendar API                   |
| reported_eps       | Earnings API                            |
| consensus_eps      | Earnings Estimates API                  |
| actual_vs_estimate | Internal compute (reported – consensus) |

### user

| Field         | Source                  |
| ------------- | ----------------------- |
| email         | Internal                |
| full_name     | Internal                |
| password_hash | Internal / Auth service |
| preferences   | Internal                |

### UserPortfolio

| Field         | Source     |
| ------------- | ---------- |
| quantity      | User input |
| avg_price     | User input |
| acquired_date | User input |

### Derived metrics 

| Derived Metric     | Source                             |
| ------------------ | ---------------------------------- |
| YoY Revenue Growth | revenue comparison between periods |
| Debt/FCF           | total_debt / free_cash_flow        |
| target_diff_pct    | price vs analyst targets           |
| earnings_next_30d  | proximity to scheduled earnings    |
