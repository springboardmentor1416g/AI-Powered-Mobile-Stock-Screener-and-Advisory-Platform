# Data Quality & Validation Pipeline

## AI-Powered Mobile Stock Screener & Advisory Platform

---

## 1. Overview

The Data Quality & Validation Pipeline ensures that all ingested financial and market data is clean, complete, consistent, and reliable before being written to the production database.

Financial data is sourced from third-party providers such as SimFin, where inconsistencies can occur due to missing values, reporting mismatches, provider-side errors, or format differences. This pipeline identifies and blocks such issues early to prevent incorrect screening results, faulty ratio calculations, misleading AI/LLM insights, and incorrect alerts.

---

## 2. Pipeline Position

The validation module runs after data ingestion and normalization but before database insertion.

### Pipeline Flow

Raw Data (CSV / API)

↓

Normalization

↓

Validation Pipeline

↓

Approved Records
 → Database
Rejected Records → Logs & Reports


Invalid or incomplete records are prevented from entering the database.

---

## 3. Validation Scope

The pipeline validates the following datasets:

- Quarterly fundamental financial statements
- Annual fundamental financial statements
- Financial metrics (Revenue, Income, etc.)
- Fiscal period continuity
- Data types and schema consistency

---

## 4. Validation Rules

### 4.1 Mandatory Field Validation

The following fields are mandatory for each record:

- Ticker
- Fiscal Year
- Fiscal Period
- Report Date
- Revenue
- Net Income
- Operating Income
- Currency

If any mandatory field is missing:
- Severity: HIGH
- Action: Record is rejected and logged as ERROR

---

### 4.2 Data Type Validation

| Field Type | Rule |
|----------|------|
| Numeric | Must parse to a valid number |
| Date | Must be ISO-compatible |
| Currency | Must be USD or INR |
| Strings | Must not contain invalid symbols |

Invalid data types result in record rejection.

---

### 4.3 Fiscal Period Validation

Rules enforced:

- No future-dated reports
- Fiscal year must be valid (≥ 1990)
- Quarterly records must use Q1–Q4
- Annual records must use FY
- No duplicate fiscal periods for the same company

Violations are logged as ERROR.

---

### 4.4 Duplicate Handling

If duplicate records are detected:

- The latest record is retained
- Older duplicates are ignored
- Duplicate rows are not inserted into the database

---

## 5. Logging

### 5.1 Log Location

All validation logs are written to:

/services/data_validation/logs/

### Report Fields

| Field | Description |
|------|------------|
| Ticker | Company symbol |
| Issue Type | Missing data, anomaly, etc. |
| Severity | INFO / WARN / ERROR |
| Affected Period | Fiscal period |
| Suggested Action | Skip / Review / Impute |

---

## 7. Fallback & Handling Strategy

| Issue | Action |
|------|-------|
| Missing mandatory metric | Reject record |
| Missing optional metric | Accept with warning |
| Duplicate record | Keep latest |
| Invalid date format | Auto-convert if possible |
| Severe anomaly | Flag for manual review |

---

## 8. Integration with Ingestion Pipeline

The validation pipeline is directly integrated into the fundamentals ingestion process.

### Execution Order
parseSimFinCSV
→ validateRow
→ write to processed CSV
→ insert into database (if valid)


Only validated records are written to the database.

---

## 9. CI/CD Compatibility

- Validation does not require database access during CI
- No raw data files are committed to the repository
- CI pipelines remain lightweight and stable
- Validation runs during local ingestion and batch jobs

---

## 10. Outcome

This pipeline ensures:

- High-quality financial data
- Reliable screening and analytics
- Accurate derived metrics and ML features
- Robust foundation for AI-driven advisory systems

The system is designed to be extensible, allowing new validation rules and providers to be added easily.

