import psycopg2

conn = psycopg2.connect(
    host="localhost",
    dbname="stock_screener",
    user="postgres",
    password="kanan40/80"
)

cur = conn.cursor()

# Analyst estimates
cur.execute("""
INSERT INTO analyst_estimates (ticker, eps_estimate, revenue_estimate, analyst_count)
VALUES ('TCS', 120.5, 250000, 18)
""")

# Price targets
cur.execute("""
INSERT INTO price_targets (ticker, target_low, target_avg, target_high, analyst_count)
VALUES ('TCS', 3200, 3600, 4000, 20)
""")

# Buyback
cur.execute("""
INSERT INTO buyback_announcements
(ticker, announcement_date, buyback_type, amount)
VALUES ('TCS', '2024-12-01', 'Open Market', 18000)
""")

# Earnings
cur.execute("""
INSERT INTO earnings_calendar
(ticker, earnings_date, fiscal_quarter, fiscal_year, status)
VALUES ('TCS', '2025-01-15', 'Q3', 2025, 'Confirmed')
""")

conn.commit()
cur.close()
conn.close()

print("Mock analyst, buyback & earnings data inserted")
