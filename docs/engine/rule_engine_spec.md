# Rule Engine Specification
**Project:** AI-Powered Mobile Stock Screener and Advisory Platform

---

## Purpose
This document defines the design, DSL (domain-specific language), validation rules, compilation rules (JSON -> SQL), supported operators and fields, and testing/validation procedures for the Screener Rule Engine. The Rule Engine converts structured DSL produced by the LLM Parser into safe, parameterized SQL queries executed against the project's PostgreSQL/TimescaleDB backend.

---

## High-level Flow
1. User natural language query (mobile UI) -> Backend /screener endpoint.
2. LLM Parser Service: Converts NL -> DSL JSON following the schema specified below. Validate JSON against schema.
3. Rule Engine (Compiler): Validates DSL fields and operators, translates DSL -> parameterized SQL (no string interpolation).
4. Runner: Executes parameterized SQL against DB, applies post-processing (computed fields), returns results in the output schema.
5. App: Displays results and caches when appropriate.

---

## DSL JSON Schema (v1) — canonical format
All LLM outputs must strictly follow this JSON schema. The LLM Parser should be instructed to output only valid JSON. The Rule Engine will reject non-conforming JSON.

Example DSL (illustrative):

```
{
  "universe": {"exchange": "NSE", "sector": "Information Technology", "custom_symbols": ["TCS","INFY"]},
  "conditions": [
    {"field": "pe", "op": "<", "value": 5},
    {"field": "peg", "op": "<=", "value": 3},
    {"field": "debt_to_fcf", "op": "<", "value": 4},
    {"field": "revenue_yoy", "op": ">", "value": 5}
  ],
  "time_window": {"type":"quarters","value":4},
  "special_filters": {"buyback_announced": true, "earnings_within_days": 30},
  "sort": [{"field":"peg","dir":"asc"}],
  "limit": 200,
  "output_fields": ["symbol","company_name","peg","debt_to_fcf","revenue_yoy","earnings_next_30d","buyback_announced"]
}
```

Field-level descriptions:
- universe: Restricts the screening universe (exchange, sector, or explicit symbols).
- conditions: Basic comparison filters. field must be from allowlist. op must be allowed operator. value is type-checked.
- time_window: Indicates the lookback window for aggregated measures (e.g., last N quarters). Optional.
- special_filters: Named boolean or structured filters (buyback_announced, earnings_within_days). These map to specific DB fields or computed logic.
- sort: Array of sorting instructions.
- limit: Max number of rows to return (sanity cap enforced server-side).
- output_fields: Allowlist of fields to return in result rows.

---

## Allowlisted Fields & Types
Only the following fields are allowed in conditions and output_fields. All field names are in snake_case and map to known DB columns or computed values.

- stock metadata: symbol (text), company_name (text), exchange (text), sector (text)
- price/fundamentals: latest_price (numeric), pe (numeric), pb (numeric), peg (numeric), revenue_ttm (numeric), revenue_yoy (numeric), revenue_qoq (numeric), ebitda (numeric), eps (numeric), eps_surprise (numeric)
- ratios/computed: debt_to_fcf (numeric), market_cap (numeric), dividend_yield (numeric)
- events: buyback_announced (boolean), earnings_next_30d (boolean), next_earnings_date (date)
- analyst: analyst_target_avg (numeric), analyst_target_low (numeric), analyst_target_high (numeric)
- sentiment: sentiment_score (numeric), news_count (int)
- user: (NOT allowed in public screeners) user_holdings_qty, user_avg_price — internal-only

---

## Supported Operators
Allowed comparison operators for op in conditions (mapped to SQL):
- <, <=, =, !=, >=, >
- in (for lists of values), not_in
- between (value should be an array [low,high])
- contains (for text contains; translates to ILIKE '%value%')

Note: Only numeric comparisons are allowed for numeric fields; text operators (contains, in) for text fields. Type mismatch causes rejection.

---

## Special Filters (and their compilation logic)
These filters represent higher-level concepts and map to specific DB logic:

- buyback_announced: true/false
  - Compile to: EXISTS (SELECT 1 FROM corporate_actions ca WHERE ca.symbol = s.symbol AND ca.action_type = 'buyback' AND ca.ann_date <= now())
  - Use indexed corporate_actions table for performance.

- earnings_within_days: N
  - Compute next_earnings_date from earnings_calendar. Compile to: next_earnings_date BETWEEN now() AND now() + interval 'N days'.

- earnings_next_30d
  - Shortcut boolean for earnings_within_days: 30.

- revenue growth over last N quarters
  - If time_window.type == 'quarters', compute revenue_yoy or revenue_qoq using financials grouped by quarter; compile with aggregate subquery.

- analyst_target comparison
  - e.g., analyst_target_low < latest_price compiles to analyst_target_low < p.close where p is latest price.

---

## JSON -> SQL Compilation Rules (safe, parameterized)
1. Allowlist mapping: Map DSL field names to internal DB column names via a hardcoded mapping dict. Reject unknown fields.
2. Parameterization: All user values must be passed as parameterized query parameters ($1, $2, ...). Never interpolate raw values into SQL.
3. Operator mapping: Use prepared SQL fragments per operator (e.g., < -> col < $n, between -> col BETWEEN $n AND $n+1).
4. Joins: Use explicit joins with aliases and subqueries to fetch latest rows.
5. Aggregates / Windows: For fields requiring aggregation (e.g., revenue over last 4 quarters), compile to subqueries using GROUP BY and HAVING where necessary. Use TimescaleDB hypertables functions for time bucketing if available.
6. Limit & Sort: Apply server-side caps (max limit = 1000 unless admin override). Enforce safe sorting by allowlisted fields only.
7. SQL Dialect: Use PostgreSQL-compatible SQL and arrays for IN operators. Use ILIKE for case-insensitive text contains.
8. Safety checks: Reject queries that would produce full-table scans without indices when possible — recommend adding a basic cost-estimate or require additional filters (e.g., sector or market_cap) for expensive queries. Log and return a friendly error if planner cost is high.

---

## Example Compilation (DSL -> Parameterized SQL)

DSL Example:
```
{"universe":{"exchange":"NSE","sector":"Information Technology"},"conditions":[{"field":"pe","op":"<=","value":5},{"field":"peg","op":"<","value":3}],"limit":100,"output_fields":["symbol","company_name","pe","peg","latest_price"]}
```

Compiled SQL (pseudo, parameterized):
```
SELECT s.symbol, s.company_name, f.pe, f.peg, p.close as latest_price
FROM stock s
JOIN financials f ON f.symbol = s.symbol AND f.period_date = (SELECT max(period_date) FROM financials ff WHERE ff.symbol = s.symbol)
JOIN price_history p ON p.symbol = s.symbol AND p.price_date = (SELECT max(price_date) FROM price_history ph WHERE ph.symbol = s.symbol)
WHERE s.exchange = $1 AND s.sector = $2 AND f.pe <= $3 AND f.peg < $4
ORDER BY f.peg ASC
LIMIT $5;
```

Params: [$1='NSE', $2='Information Technology', $3=5, $4=3, $5=100]

---

## Post-processing & Output Schema
After SQL execution, the Runner should:
- Compute any derived fields requested in output_fields not returned by SQL (e.g., debt_to_fcf, target_low_diff_pct).
- Format the output as JSON array, following the agreed output schema. Example row:

```
{
  "symbol": "TCS",
  "company_name": "Tata Consultancy Services",
  "peg": 2.4,
  "debt_to_fcf": 0.22,
  "target_low_diff_pct": -8,
  "revenue_growth_yoy": 12.3,
  "earnings_next_30d": true,
  "buyback_announced": true
}
```

---

## Validation & Error Handling
- Schema validation: Use JSON Schema (ajv for Node.js) to reject malformed LLM outputs. Return error codes with messages describing missing required fields or type mismatches.
- Field allowlist validation: Reject unknown fields and log attempts.
- Operator validation: Reject unsupported operators.
- Cost estimation: If the compiled SQL is expected to be expensive (no indexed filters, full-table scan risk), return a helpful message and suggest adding filters.
- Audit logs: Log parsed DSL, compiled SQL, parameter list (sanitized — do not log PII), and execution time for debugging and reproducibility.

---

## Testing Strategy
1. Unit tests (Compiler): For each DSL example, assert correct SQL fragment and parameter list.
2. Integration tests (E2E): Mock DB with sample dataset; run full flow: NL -> LLM (mock) -> DSL -> compile -> run -> verify expected results.
3. Performance tests: Create a dataset with 100k symbols & time-series; measure query times and optimize indexes (price_date, symbol, sector, period_date).
4. LLM robustness tests: Provide a test suite of 50 natural language queries of increasing complexity; validate that the LLM outputs valid DSL or a graceful failure message.
5. Security tests: Attempt to inject bad field names or operators; ensure compiler sanitizes and rejects them.

---

## Deployment & Ops Notes
- Runtime: The Rule Engine should run as a separate microservice (e.g., rule-engine) behind API Gateway.
- Scaling: Keep Compiler stateless; Runner can scale horizontally. Cache compiled SQL for repeated identical DSL to speed up execution.
- Monitoring: Track metrics: DSL parse success rate, compile errors, average execution time, cache hit rate, error rates.
- Alerting: Alert on high error rates, slow queries, and large increases in LLM parse failures.

---

## Appendix: Example DSLs & Expected Behavior
1. Simple numeric filter: "Show IT stocks with PE < 5" -> DSL with universe sector=IT and condition pe < 5 -> compile to SQL joining latest financials & price.
2. Time-windowed growth: "Companies with revenue growth > 10% over last 4 quarters" -> time_window quarters=4 and computed revenue_yoy condition; compile to aggregate subquery.
3. Event filter: "Stocks with buybacks announced" -> special_filters.buyback_announced=true -> compile to EXISTS corporate_actions subquery.
4. Mixed: "IT stocks with PEG < 3, debt/FCF < 4, and earnings within 30 days" -> combine numeric, computed, and special filters into a single SQL with proper joins and parameters.

---

*End of Rule Engine Specification*
