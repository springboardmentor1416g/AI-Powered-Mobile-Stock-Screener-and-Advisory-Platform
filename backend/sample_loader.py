# /backend/database/sample_loader.py
import os
import time
import psycopg2
import csv
from psycopg2.extras import execute_values

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/stock_screener")

def load_companies(conn, csv_path='sample_companies.csv'):
    with conn.cursor() as cur:
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            rows = [(r['ticker'], r['name'], r.get('sector'), r.get('industry'), r.get('exchange'), int(r.get('market_cap') or 0)) for r in reader]
        execute_values(cur, "INSERT INTO companies (ticker, name, sector, industry, exchange, market_cap) VALUES %s ON CONFLICT (ticker) DO NOTHING", rows)
        conn.commit()

def load_price_history(conn, csv_path='sample_price_history.csv', batch=1000):
    with conn.cursor() as cur:
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            rows = []
            for r in reader:
                rows.append((r['time'], r['ticker'], r.get('open') or None, r.get('high') or None, r.get('low') or None, r.get('close') or None, r.get('volume') or None, r.get('adj_close') or None))
                if len(rows) >= batch:
                    execute_values(cur,
                        "INSERT INTO price_history (time, ticker, open, high, low, close, volume, adj_close) VALUES %s ON CONFLICT DO NOTHING",
                        rows)
                    rows = []
            if rows:
                execute_values(cur,
                    "INSERT INTO price_history (time, ticker, open, high, low, close, volume, adj_close) VALUES %s ON CONFLICT DO NOTHING",
                    rows)
        conn.commit()

def main():
    import urllib.parse as up
    print("Connecting to DB:", DATABASE_URL)
    conn = psycopg2.connect(DATABASE_URL)
    time.sleep(2)
    load_companies(conn)
    load_price_history(conn)
    conn.close()
    print("Sample data loaded.")

if __name__ == "__main__":
    main()