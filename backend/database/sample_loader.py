import psycopg2

<<<<<<< HEAD
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
=======
# NOTE:
# Update user/password/host if needed before running.

conn = psycopg2.connect(
    dbname="stock_screener",
    user="postgres",
    password="yourpassword",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# Insert a sample company
cur.execute("""
INSERT INTO companies (ticker, name, sector, industry, exchange, market_cap)
VALUES ('TCS', 'Tata Consultancy Services', 'IT', 'Software Services', 'NSE', 120000000000)
ON CONFLICT (ticker) DO NOTHING;
""")

# Insert a sample price row
cur.execute("""
INSERT INTO price_history (time, ticker, open, high, low, close, volume)
VALUES ('2024-01-01 09:15:00', 'TCS', 3500, 3550, 3490, 3540, 1200000)
ON CONFLICT DO NOTHING;
""")

conn.commit()
cur.close()
conn.close()

print("Sample data inserted!")
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
