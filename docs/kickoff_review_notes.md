# Kickoff Review Notes
**Project:** AI-Powered Mobile Stock Screener & Advisory Platform  

---

## 1. Purpose of This Document
These notes summarize the discussions, decisions, assumptions, and approvals from the **Kickoff & Requirements Finalization** module.  
They serve as the official record confirming that scope, field catalog, data sources, data model, and rule engine requirements are finalized and approved for progressing to Week 2 development.

---

## 2. Summary of Discussions

### 2.1 Supported Markets
- Initial market coverage: **NSE (India)**.  
- Additional markets (BSE / US) considered for later phases.  
- Decision: Build architecture to be multi-exchange capable but fetch data only for NSE in MVP.

### 2.2 Scope of Screeners
The platform will support filtering using:  
- **Fundamentals:** PE, PB, PEG, revenue, EBITDA, EPS, FCF, debt.  
- **Computed metrics:** Debt/FCF, revenue YoY/QoQ, PEG if not provided.  
- **Analyst outlook:** Analyst rating, price target low/avg/high.  
- **Corporate actions:** Buyback announcements, dividends, splits.  
- **Earnings events:** Next earnings date, EPS surprise.  
- **Price & technicals:** OHLCV, price momentum (future).  
- **Sentiment:** News sentiment (optional for MVP).

### 2.3 Natural Language Query Support
- Full NLQ capability via LLM.  
- DSL defined for supported operators, fields, and special filters.  
- Example queries documented (e.g., “Show IT stocks with PEG < 3”, “Earnings next 30 days”).  
- Mapping created for synonyms → canonical DSL fields.

### 2.4 Data Freshness Requirements
- **Fundamentals:** EOD refresh or when updated by provider.  
- **Price history:** EOD for MVP; intraday support in later sprint.  
- **Analyst data:** Daily refresh.  
- **Corporate actions:** As soon as announced by exchange.  
- Decision: **Use EOD for MVP** to reduce API cost and ingestion complexity.

---

## 3. Finalized Deliverables
| Deliverable | Status | Notes |
|------------|--------|-------|
| Field Catalog | ✔ Completed | Stored as `/docs/data_model/field_catalog.xlsx` |
| Source Mapping | ✔ Completed | `/docs/data_model/source_mapping.md` |
| ERD v1 | ✔ Completed | `/docs/data_model/ERD_v1.png` (conceptual) |
| Rule Engine Spec | ✔ Completed | `/docs/engine/rule_engine_spec.md` |
| Review Notes | ✔ This file | Summary |

---

## 4. Key Decisions Made

### 4.1 Data Providers (MVP)
- **Price data:** Twelve Data (EOD) or Yahoo Finance for prototype.  
- **Fundamentals:** FinancialModelingPrep (FMP).  
- **Analyst estimates:** Yahoo Finance aggregates (fallback).  
- **Corporate actions:** NSE announcements.  
Decision rationale: Balances quality, accessibility, and development speed.

### 4.2 Initial Data Model
Core entities finalized:
- **Stock**, **Financials**, **PriceHistory**, **AnalystEstimates**, **CorporateActions**,  
  **EarningsCalendar**, **UserPortfolio**, **WatchlistAlerts**.

Decision rationale: Covers MVP + future-proof for Week 3–4 alerts, portfolio insights, and earnings-based advisory.

### 4.3 Screening Rule Engine Standards
- Strict allowlist for fields and operators.  
- Parameterized SQL only (no dynamic SQL).  
- Special filters (buyback, earnings_window) implemented as subqueries.  
- DSL JSON structure fixed and enforced with JSON Schema.

Decision rationale: Ensures safety, accuracy, and predictable LLM → DSL → SQL translation.

---

## 5. Assumptions & Constraints

### 5.1 Assumptions
- LLM outputs can be controlled via JSON schema + prompt engineering.  
- Provider APIs remain stable for required fields.  
- EOD data is sufficient for Week 2 demo.  
- Project team has access to basic cloud resources (DB + API access).

### 5.2 Constraints
- Analyst data availability is limited in free APIs → fallback strategy required.  
- Corporate action feeds from NSE may require parsing/agreements → temporary news-based detection allowed for MVP.  
- Rate limits: Free tiers of APIs require caching and snapshotting.

---

## 6. Risks & Mitigation

### 6.1 LLM Misinterpretation
- Mitigation: JSON Schema + strict field allowlist + synonyms mapping.

### 6.2 Missing or Stale Data
- Mitigation: Daily snapshots + fallback sources + data quality checks.

### 6.3 Performance
- Mitigation: TimescaleDB for time-series + indexed queries + Redis caching.

### 6.4 Compliance & Disclaimer
- Mitigation: Produce **informational only** output and avoid financial advice wording.

---

## 7. Items Requiring Future Review
- Full multi-exchange expansion after MVP.  
- Intraday data ingestion pipeline.  
- Advanced sentiment scoring using custom ML.  
- Expanding DSL for more technical indicators.  
- Corporate filings integration (EDGAR / MCA / NSE).

---

## 8. Approval Summary
The project now has a **clear foundation** to begin with:  
- LLM Parser development  
- Rule Engine implementation  
- Initial ingestion pipeline setup  
- React Native mobile prototype


---

*End of Review Notes*
