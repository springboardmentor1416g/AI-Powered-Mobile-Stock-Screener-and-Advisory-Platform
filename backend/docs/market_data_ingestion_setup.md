# Market Data Ingestion Setup

## Prerequisites
- Python 3.10+
- API Key for Market Data

## Steps
1. Set environment variabl# Validation Report – Fundamental Data Ingestion & Normalization

**Module:** Fundamental Data Ingestion & Normalization  
**Project:** AI-Powered Mobile Stock Screener & Advisory Platform  
**Report Date:** 19-Dec-2025  

---

## 1. Objective

The purpose of this validation report is to verify the **completeness, correctness, and consistency**
of the ingested and normalized **fundamental financial data**.

This validation ensures the data is ready for:
- Stock screening and filtering
- Time-series analysis
- Database ingestion (PostgreSQL / TimescaleDB)
- Downstream analytics and AI-driven insights

---

## 2. Data Source

| Item | Description |
|-----|------------|
| Data Type | Fundamental financial metrics |
| Frequency | Quarterly |
| Format | CSV |
| Source | Ingestion pipeline (`fundamentals_ingest.py`) |

---

## 3. Files Validated

All validated files are located at:

es
2. Run data_ingestion.py
3. Verify data using db_validation.sql

## Folder Structure
- backend/
- storage/
- logs/
