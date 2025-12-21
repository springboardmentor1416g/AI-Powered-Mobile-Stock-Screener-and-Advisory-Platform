# Data Source Mapping

This document maps each data field in the system to its corresponding external API or internal computation source.

---

## 1. Stock Metadata
| Field Name     | Entity | Source API / System         | Notes               |
|----------------|--------|-----------------------------|---------------------|
| symbol         | Stock  | NSE/BSE Exchange API        | Primary identifier  |
| company_name   | Stock  | Market API                  |                     |
| sector         | Stock  | Market/Fundamentals API     |                     |
| exchange       | Stock  | Config / Exchange Metadata  | e.g., NSE           |
| market_cap     | Stock  | Fundamentals API            | Derived if not provided |

---

## 2. Fundamentals & Financial Statements
| Field Name       | Entity      | Source              | Notes                   |
|------------------|--------------|---------------------|-------------------------|
| revenue          | Financials  | Fundamentals API    | Quarterly / yearly      |
| EBITDA           | Financials  | Fundamentals API    |                         |
| EPS              | Earnings    | Earnings Reports    | Latest EPS              |
| net_income       | Financials  | Fundamentals API    |                         |
| debt             | Financials  | Fundamentals API    |                         |
| free_cash_flow   | Financials  | Fundamentals API    |                         |

---

## 3. Computed / Derived Fields
| Field Name       | Entity      | Source            | Formula / Description            |
|------------------|-------------|-------------------|----------------------------------|
| PE               | Financials  | Computed          | price / EPS                      |
| PEG_ratio        | Financials  | Computed          | PE / growth_rate                 |
| Debt_to_FCF      | Financials  | Computed          | debt / free_cash_flow           |
| revenue_growth_yoy | Financials | Computed         | (rev_this_year - last_year) / last_year |

---

## 4. Analyst Estimates
| Field Name          | Entity           | Source        | Notes |
|---------------------|------------------|---------------|-------|
| analyst_rating      | AnalystEstimates | Analyst API   | Buy/Hold/Sell |
| price_target_low    | AnalystEstimates | Analyst API   | Lowest estimate |
| price_target_avg    | AnalystEstimates | Analyst API   | Consensus estimate |
| price_target_high   | AnalystEstimates | Analyst API   | Highest estimate |
| estimate_confidence | AnalystEstimates | Analyst API   | Score if provided |

---

## 5. Price History (OHLCV)
| Field Name | Entity       | Source        |
|------------|--------------|---------------|
| date       | PriceHistory | Market Price API |
| open       | PriceHistory | Market Price API |
| high       | PriceHistory | Market Price API |
| low        | PriceHistory | Market Price API |
| close      | PriceHistory | Market Price API |
| volume     | PriceHistory | Market Price API |

---

## 6. Corporate Actions
| Field Name         | Entity           | Source                 |
|--------------------|------------------|------------------------|
| type               | CorporateActions | Corporate Actions API  |
| announcement_date  | CorporateActions | Corporate Actions API  |
| details            | CorporateActions | Corporate Actions API  |
| buyback_announced  | CorporateActions | Corporate Actions API  |

---

## 7. Earnings Events
| Field Name         | Entity           | Source               |
|--------------------|------------------|----------------------|
| next_earnings_date | EarningsCalendar | Exchange Calendar   |
| last_eps           | EarningsCalendar | Earnings API        |
| surprise_pct       | EarningsCalendar | Computed (actual vs estimated) |

