#!/usr/bin/env python3
"""sample_loader.py
Simple script to load sample rows into the stock_screener DB for testing.
Requires: psycopg2-binary
Usage: python3 sample_loader.py --dsn 'postgresql://user:pass@localhost:5432/stock_screener'
"""

import argparse
import psycopg2
from datetime import datetime, timedelta

SAMPLE_COMPANIES = [
    ('TCS', 'Tata Consultancy Services', 'Information Technology', 'Software', 'NSE', 4500000000000),
    ('INFY', 'Infosys Ltd', 'Information Technology', 'Software', 'NSE', 3500000000000),
    ('WIPRO', 'Wipro Ltd', 'Information Technology', 'Software', 'NSE', 600000000000),
    ('HCLTECH', 'HCL Technologies Ltd', 'Information Technology', 'Software', 'NSE', 800000000000),
    ('LT', 'Larsen & Toubro', 'Industrials', 'Engineering', 'NSE', 900000000000),
]

SAMPLE_PRICES = [
    # (ticker, days_ago, open, high, low, close, volume)
    ('TCS', 0, 3380.0, 3420.0, 3365.5, 3400.25, 1523000),
    ('INFY', 0, 1300.0, 1330.0, 1290.0, 1315.5, 1200000),
    ('WIPRO', 0, 400.0, 410.0, 395.0, 405.25, 800000),
    ('HCLTECH', 0, 1000.0, 1015.0, 995.0, 1008.0, 600000),
    ('LT', 0, 2900.0, 2950.0, 2880.0, 2925.0, 300000),
]

def insert_samples(conn):
    cur = conn.cursor()
    # insert companies
    for t, name, sector, industry, exchange, mcap in SAMPLE_COMPANIES:
        cur.execute("""INSERT INTO companies (ticker, name, sector, industry, exchange, market_cap)
                       VALUES (%s,%s,%s,%s,%s,%s)
                       ON CONFLICT (ticker) DO UPDATE SET name = EXCLUDED.name, sector = EXCLUDED.sector, industry = EXCLUDED.industry, exchange = EXCLUDED.exchange, market_cap = EXCLUDED.market_cap;""",
                    (t, name, sector, industry, exchange, mcap))
    conn.commit()

    # insert prices (today)
    for ticker, days_ago, o, h, l, c, v in SAMPLE_PRICES:
        time = datetime.utcnow() - timedelta(days=days_ago)
        cur.execute("""INSERT INTO price_history (time, ticker, open, high, low, close, volume, adj_close)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                       ON CONFLICT (time, ticker) DO NOTHING;""",
                    (time, ticker, o, h, l, c, v, c))
    conn.commit()

    # insert a sample fundamentals_quarterly row
    cur.execute("""INSERT INTO fundamentals_quarterly (ticker, period_start, period_end, quarter, revenue, net_income, eps, ebitda, pe_ratio, pb_ratio)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                   ON CONFLICT DO NOTHING;""",
                ('TCS','2025-04-01','2025-06-30','Q1-2025',120000000000,15000000000,45.2,25000000000,22.5,4.1))
    conn.commit()

    # insert a sample analyst_estimates row
    cur.execute("""INSERT INTO analyst_estimates (ticker, provider, estimate_date, eps_estimate, price_target_low, price_target_avg, price_target_high, rating)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING;""",
                ('TCS','Yahoo', '2025-07-01', 46.0, 3200, 3500, 3800, 'Buy'))
    conn.commit()

    cur.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dsn', help='Postgres DSN', required=True)
    args = parser.parse_args()
    conn = psycopg2.connect(args.dsn)
    try:
        insert_samples(conn)
        print('Sample data inserted successfully')
    finally:
        conn.close()
