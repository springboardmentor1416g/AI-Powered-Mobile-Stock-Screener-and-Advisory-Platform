# Data Source Mapping — AI-Powered Mobile Stock Screener & Advisory Platform

This document describes how external market/fundamentals/analyst APIs map to the
internal fields used in the data model and rule engine.

---

## 1. Market & Reference Data

| API Field        | Internal Field | Data Type | Description                               | Source / Provider           |
|------------------|----------------|-----------|-------------------------------------------|-----------------------------|
| symbol           | symbol         | STRING    | Stock symbol / ticker                     | Exchange / Market API       |
| companyName      | company_name   | STRING    | Full company name                         | Exchange / Market API       |
| sector           | sector         | STRING    | Sector classification                      | Market metadata API         |
| industry         | industry       | STRING    | Industry classification                    | Market metadata API         |
| exchange         | exchange       | STRING    | Exchange code (NSE/BSE/NYSE/NASDAQ etc.)  | Exchange / Market API       |
| marketCap        | market_cap     | FLOAT     | Market capitalization                     | Fundamentals / Market API   |

---

## 2. Fundamentals & Financial Performance

| API Field          | Internal Field         | Data Type | Description                                  | Transformation |
|--------------------|------------------------|-----------|----------------------------------------------|----------------|
| revenue            | revenue                | FLOAT     | Quarterly revenue                            | As-is          |
| ebitda             | ebitda                 | FLOAT     | Quarterly EBITDA                             | As-is          |
| eps                | eps                    | FLOAT     | Earnings per share                           | As-is          |
| revenueYoYGrowth   | revenue_growth_yoy     | FLOAT     | YoY revenue growth (%)                       | Compute from history |
| ebitdaYoYGrowth    | ebitda_growth_yoy      | FLOAT     | YoY EBITDA growth (%)                        | Compute from history |
| totalDebt          | total_debt             | FLOAT     | Total debt (short + long term)               | Sum fields     |
| freeCashFlow       | free_cash_flow         | FLOAT     | Free cash flow                               | As-is          |
| peRatio            | pe_ratio               | FLOAT     | Price to Earnings ratio                      | As-is or compute |
| pegRatio           | peg_ratio              | FLOAT     | PEG ratio (P/E ÷ EPS growth)                 | As-is or compute |

Derived internal field:

- `debt_to_fcf` = `total_debt / free_cash_flow` (years to pay off debt)

---

## 3. Analyst Estimates & Targets

| API Field             | Internal Field        | Data Type | Description                          | Notes                          |
|-----------------------|-----------------------|-----------|--------------------------------------|---------------------------------|
| analystRating         | analyst_rating        | STRING    | Aggregate rating (Buy/Hold/Sell)     | Normalized to enum             |
| priceTargetLow        | price_target_low      | FLOAT     | Lowest analyst price target          | Used for “below target” filter |
| priceTargetAvg        | price_target_avg      | FLOAT     | Average analyst price target         | Display / ranking              |
| priceTargetHigh       | price_target_high     | FLOAT     | Highest analyst price target         | Display / risk band            |
| nextEarningsDate      | next_earnings_date    | DATE      | Next scheduled earnings date         | From earnings calendar API     |
| lastEarningsSurprise  | last_earnings_surprise| FLOAT     | Last EPS surprise (%)                | Optional, Phase 2              |

Internal computed field (for rules):

- `target_low_diff_pct` = `(current_price - price_target_low) / price_target_low * 100`

---

## 4. Corporate Actions & Events

| API Field           | Internal Field     | Data Type | Description                        | Source              |
|---------------------|--------------------|-----------|------------------------------------|---------------------|
| buybackFlag         | buyback_announced  | BOOL      | Whether company announced buyback  | Corporate actions API / SEBI |
| buybackAmount       | buyback_amount     | FLOAT     | Approx. value of buyback program   | Same as above       |
| dividendDeclared    | dividend_declared  | BOOL      | Dividend event                     | Corporate actions API |
| splitEvent          | split_event        | BOOL      | Stock split event                  | Corporate actions API |

---

## 5. Price History (Time-Series)

| API Field | Internal Field | Data Type | Description                    |
|----------|----------------|-----------|--------------------------------|
| open     | open           | FLOAT     | Opening price for the day     |
| high     | high           | FLOAT     | High price for the day        |
| low      | low            | FLOAT     | Low price for the day         |
| close    | close          | FLOAT     | Closing price for the day     |
| volume   | volume         | INT       | Traded volume for the day     |
| ts       | time           | TIMESTAMP | Candle timestamp               |

Stored in **TimescaleDB hypertable** `price_history`.

---

## 6. General Notes

- All timestamps are stored in **UTC**.
- Currency normalization (e.g., INR vs USD) is handled at the ingestion layer.
- Any missing fundamentals are flagged and excluded from strict rules (e.g., `PEG < 3`).
