import psycopg2
import requests
from datetime import datetime

# Database Connection (Update with your config)
DB_CONFIG = {
    #"dbname": "dbname", "user": "user", "password": "pass", "host": "localhost"
    "dbname": "stock_screener", "user": "postgres", "password": "newpassword", "host": "localhost"
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def ingest_analyst_ratings(ticker):
    """
    Fetches data from external API (e.g., FMP/Yahoo) and saves to DB.
    """
    # Mock API Call - Replace with real provider
    # response = requests.get(f"https://api.provider.com/v3/analyst-estimates/{ticker}...")
    # data = response.json()
    
    # Mock Data for demonstration
    data = {
        "date": datetime.now().date(),
        "analyst_count": 12,
        "high": 180.00,
        "low": 140.00,
        "avg": 160.50,
        "consensus": "Strong Buy"
    }

    conn = get_db_connection()
    cur = conn.cursor()
    
    query = """
        INSERT INTO analyst_ratings (ticker, date, analyst_count, high_target, low_target, avg_target, consensus_rating)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cur.execute(query, (ticker, data['date'], data['analyst_count'], data['high'], data['low'], data['avg'], data['consensus']))
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"Ingested ratings for {ticker}")

if __name__ == "__main__":
    # This can be called by a scheduler or route
    ingest_analyst_ratings("AAPL")