# Screener Rule Engine Specification

## 1. Filters / Rules

### 1.1 PEG Ratio
- Description: Filter stocks with PEG ratio below threshold to find undervalued stocks with good growth potential.
- Logic: PEG < 3

### 1.2 Debt
- *Description: Include stocks where company can repay debt in 4 years or less using free cash flow.
- Logic: Debt / FCF < 4

### 1.3 YoY Revenue Growth
- Description: Include companies whose revenue is growing year-over-year.
- Logic: Revenue_YoY > 5%

### 1.4 Buyback Flag
- Description: Include only companies that have announced stock buybacks.
- Logic: buyback_announced = true

### 1.5 Upcoming Earnings
- Description: Include companies with quarterly earnings scheduled in the next 30 days.
- Logic: earnings_next_30d = true

### 1.6 Analyst Target Comparison
- Description: Check if current stock price is below or near the analyst low target to identify potentially undervalued stocks.
- Logic: target_low_diff_pct = (CurrentPrice - TargetLow)/TargetLow * 100
        Include if target_low_diff_pct <= 0


## 2. Table of Fields and Source

| Field Name           | Description                          | Source          |
|---------------------|--------------------------------------|----------------|
| symbol              | Stock ticker symbol                  | NSE/BSE API    |
| company_name        | Full company name                     | Market API     |
| peg                 | Price/Earnings to Growth ratio        | Computed       |
| debt_to_fcf         | Debt divided by free cash flow        | Computed       |
| target_low_diff_pct | % difference from analyst low target | Computed       |
| revenue_growth_yoy  | YoY revenue growth %                  | Fundamentals API|
| earnings_next_30d   | Earnings call within next 30 days     | Exchange calendar |
| buyback_announced    | Buyback announced (true/false)       | Corporate Actions API |


## 3. Example Queries & JSON Output

| User Query | Rules Applied | Sample JSON Output |
|------------|---------------|------------------|
| "Show NSE IT stocks with PEG < 3, revenue growth > 5%, buyback announced, earnings in next 30 days" | PEG < 3, Debt/FCF < 4, Revenue_YoY > 5%, buyback_announced = true, earnings_next_30d = true | { "symbol": "TCS", "company_name": "Tata Consultancy Services", "peg": 2.4, "debt_to_fcf": 0.22, "target_low_diff_pct": -8, "revenue_growth_yoy": 12.3, "earnings_next_30d": true, "buyback_announced": true } |


## 4. DSL Mapping Example

User Query: "Show NSE IT stocks with PEG < 3, revenue growth > 5%, buyback announced"

DSL JSON:
{
  "exchange": "NSE",
  "sector": "IT",
  "peg": {"lt": 3},
  "revenue_growth_yoy": {"gt": 5},
  "buyback_announced": true
}

## 5. Notes
- Rules combine with AND logic by default.
- JSON output ensures frontend consistency.
- This spec guides backend implementation of the screener engine.