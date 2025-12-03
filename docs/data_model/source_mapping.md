# Data Source Mapping

This document describes how external API fields map to the internal fields used in the data model.

---

## 1. API → Internal Field Mapping Table

| API Field | Internal Field | Data Type | Description | Transformation |
|-----------|----------------|-----------|-------------|----------------|
| custId | customer_id | STRING | Unique customer ID provided during onboarding | None |
| mobNo | phone_number | STRING | Mobile number | Normalize, remove spaces |
| accBal | account_balance | FLOAT | Customer account balance | Convert to float |
| txnCount | transaction_count | INT | Number of transactions in last 30 days | API provides direct count |
| loginTs | last_login_date | DATE | Customer last login timestamp | Convert from epoch/ISO to date |
| segmentScore | risk_score | FLOAT | Calculated risk score from ML model | None |

---

## 2. Notes
- All timestamps must be converted to UTC.
- Null fields must follow fallback rules:
  - `phone_number` → blank
  - `account_balance` → 0
  - `transaction_count` → 0
- Numeric validations must run before rule engine execution.
