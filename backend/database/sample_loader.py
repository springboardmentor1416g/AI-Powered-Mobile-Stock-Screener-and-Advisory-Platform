import psycopg2

def load_sample_data():
    conn = psycopg2.connect(
        host="localhost",
        database="stock_screener",
        user="postgres",
        password="postgres"
    )

    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO companies (ticker, name, sector, exchange, market_cap)
    VALUES
        ('AAPL', 'Apple Inc.', 'Technology', 'NASDAQ', 2500000000000),
        ('MSFT', 'Microsoft Corporation', 'Technology', 'NASDAQ', 2300000000000)
    ON CONFLICT (ticker) DO NOTHING;
    """)

    conn.commit()
    cursor.close()
    conn.close()

    print("Sample data loaded successfully.")

if __name__ == "__main__":
    load_sample_data()
