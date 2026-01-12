import psycopg2

conn = psycopg2.connect(
    host="db",
    database="stock_screener",
    user="postgres",
    password="postgres"
)

cur = conn.cursor()

cur.execute("""
INSERT INTO companies (ticker, name, sector, exchange)
VALUES ('TCS', 'Tata Consultancy Services', 'IT', 'NSE')
ON CONFLICT (ticker) DO NOTHING;
""")

conn.commit()
cur.close()
conn.close()

print("Sample data inserted successfully.")
