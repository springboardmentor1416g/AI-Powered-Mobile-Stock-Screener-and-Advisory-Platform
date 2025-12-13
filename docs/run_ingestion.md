# How to run ingestion (quick)

Prerequisites:
- PostgreSQL + TimescaleDB running (see docker-compose.yml)
- Python dependencies installed:
pip install -r requirements.txt


Run market data ingestion:


python backend/ingestion/data_ingestion.py


Run fundamentals ingestion:


python backend/services/market_ingestion/fundamentals_ingest.py

