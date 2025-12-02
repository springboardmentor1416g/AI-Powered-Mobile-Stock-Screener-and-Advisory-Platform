# Screener Rule Engine Specification

## Purpose
Evaluate stocks based on fundamental, technical, analyst and event filters.

## Supported Filters
- peg_ratio < value
- debt_to_fcf < value
- revenue_growth_yoy > value
- analyst_rating = BUY/HOLD/SELL
- buyback_announced = true
- earnings_next_30d = true
- analyst_upside_pct > value

## DSL Format
{
  "filters": [
    { "field": "peg_ratio", "op": "<", "value": 3 }
  ],
  "sort": [
    { "field": "revenue_growth_yoy", "direction": "DESC" }
  ],
  "limit": 50
}

## Sample Output
{
  "symbol": "TCS",
  "peg": 2.4,
  "debt_to_fcf": 0.22,
  "revenue_growth_yoy": 12.3,
  "earnings_next_30d": true,
  "buyback_announced": true
}
