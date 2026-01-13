# Screening Rule Engine Requirements

## Overview

This document defines the Screening Rule Engine requirements and the
JSON rule configuration format used by the platform.

------------------------------------------------------------------------

## 1. Universe Selection Rules

-   Filter by exchanges (e.g., NSE, BSE)
-   Restrict sectors or industries
-   Optional market-cap ranges
-   Universe is applied before numerical/valuation filters

------------------------------------------------------------------------

## 2. Numerical Filters

Examples used by the screener: - PEG Ratio \< 3\
- Debt / Free Cash Flow ≤ 4\
- YoY Revenue Growth \> 0\
- YoY EBITDA Growth \> 0

Each filter contains: - `field` - `operator` - `value` - Optional:
`description`

------------------------------------------------------------------------

## 3. Event-Based Conditions

-   `buyback_announced = true`
-   Earnings scheduled within next *N* days
    -   Uses: `days_to_earnings <= 30`

------------------------------------------------------------------------

## 4. Valuation Logic

Analyst target vs current stock price comparisons: - `at_or_below_low` →
Current price ≤ lowest analyst target\
- Other modes may include: `below_avg`, `below_high`, `near_target`

------------------------------------------------------------------------

## 5. Sorting and Pagination

-   Multi-field sorting allowed
-   Pagination includes:
    -   `limit`
    -   `offset`

------------------------------------------------------------------------

# JSON Rule Configuration 

``` json
{
  "universe": {
    "exchanges": ["NSE"],
    "sectors": [
      "Information Technology",
      "Semiconductors",
      "Software",
      "Telecom"
    ],
    "market_cap_min": 1000,
    "market_cap_max": null
  },

  "filters": [
    {
      "field": "peg_ratio",
      "operator": "<",
      "value": 3,
      "description": "Stock must be undervalued relative to growth"
    },
    {
      "field": "debt_to_fcf",
      "operator": "<=",
      "value": 4,
      "description": "Company must not be overleveraged"
    },
    {
      "field": "revenue_growth_yoy",
      "operator": ">",
      "value": 0,
      "description": "Company must show positive YoY revenue growth"
    },
    {
      "field": "ebitda_growth_yoy",
      "operator": ">",
      "value": 0,
      "description": "Company must show YoY EBITDA improvement"
    }
  ],

  "events": {
    "buyback_announced": true,
    "earnings": {
      "within_days": 30
    }
  },

  "valuation": {
    "price_vs_target": {
      "condition": "at_or_below_low",
      "description": "Current price ≤ analyst low target"
    }
  },

  "sentiment": {
    "analyst_rating_in": ["Buy", "Strong Buy"],
    "news_sentiment_min": null
  },

  "sort": [
    { "field": "peg_ratio", "direction": "asc" },
    { "field": "revenue_growth_yoy", "direction": "desc" }
  ],

  "pagination": {
    "limit": 100,
    "offset": 0
  }
}
```


