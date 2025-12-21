# Validation Pipeline

This module validates financial & price data before loading into the DB.

Steps:
1. Ingest raw data
2. Validate using validate_data.py
3. If HIGH severity → stop ingestion
4. If only WARN → continue with caution
5. Logs stored in /services/data_validation/logs/
6. Reports generated in /services/data_validation/reports/
    