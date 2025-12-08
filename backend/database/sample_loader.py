import psycopg2
from psycopg2.extras import execute_batch
import yfinance as yf
from nselib import capital_market
from datetime import datetime
import time
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD")
}

conn = psycopg2.connect(**DB_CONFIG)


def get_nifty500_tickers():
    """Fetch all NIFTY 500 tickers dynamically from NSE"""
    print("Fetching NIFTY 500 tickers from NSE...")
    try:
        df = capital_market.nifty500_equity_list()
        symbols = [f"{x}.NS" for x in df['Symbol'].tolist()]
        print(f"{len(symbols)} tickers fetched from NSE.")
        return symbols
    except Exception as e:
        print(f" NSE API failed ({e}). Using fallback top 10 tickers.")
        return ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", 
                "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "LICI.NS", "HINDUNILVR.NS"]

def bulk_import():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        print("Connected to PostgreSQL")

        tickers = get_nifty500_tickers()
        print(f"Starting import for {len(tickers)} companies...")

        for i, ticker in enumerate(tickers, 1):
            try:
                stock = yf.Ticker(ticker)
                info = stock.info

                if 'currentPrice' not in info:
                    print(f" {ticker}: No price data found. Skipping.")
                    continue

                #Company Info
                name = info.get('longName', ticker)
                sector = info.get('sector', 'Unknown')
                industry = info.get('industry', 'Unknown')
                mcap = info.get('marketCap', 0)

                #Fundamental Ratios
                pe_ratio = info.get('trailingPE', None)
                total_debt = info.get('totalDebt', 0)
                fcf = info.get('freeCashflow', 1)
                debt_to_fcf = round(total_debt / fcf, 2) if fcf and fcf > 0 else 0
                revenue_growth = info.get('revenueGrowth', 0)
                revenue_growth = revenue_growth * 100 if revenue_growth else 0

                #UPSERT Companies
                cur.execute("""
                    INSERT INTO companies (ticker, name, sector, industry, market_cap)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (ticker) DO UPDATE 
                    SET name = EXCLUDED.name,
                        sector = EXCLUDED.sector,
                        industry = EXCLUDED.industry,
                        market_cap = EXCLUDED.market_cap;
                """, (ticker, name, sector, industry, mcap))

                cur.execute("""
                    INSERT INTO fundamentals_quarterly (ticker, pe_ratio, roe, roa, operating_margin, net_income, revenue, eps, pb_ratio, created_at)
                    VALUES (%s, %s, 0, 0, 0, 0, 0, 0, 0, %s, %s)
                    ON CONFLICT (ticker) DO UPDATE 
                    SET pe_ratio = EXCLUDED.pe_ratio,
                        created_at = EXCLUDED.created_at;
                """, (ticker, pe_ratio, info.get('pegRatio',None), datetime.now()))

                #Latest Price
                hist = stock.history(period="1d")
                if not hist.empty:
                    latest = hist.iloc[-1]
                    cur.execute("""
                        INSERT INTO price_history (ticker, time, close, volume)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (ticker, time) DO UPDATE
                        SET close = EXCLUDED.close,
                            volume = EXCLUDED.volume;
                    """, (ticker, latest.name.to_pydatetime(), float(latest['Close']), int(latest['Volume'])))

                conn.commit()
                print(f" {i}/{len(tickers)}: {ticker} saved.")

                # Small delay to avoid API throttling
                time.sleep(0.1)

            except Exception as e:
                print(f"Error processing {ticker}: {e}")
                conn.rollback()

  
        cur.close()
        conn.close()
        print("\nImport Complete! Database is updated.")

    except Exception as e:
        print(f"Critical DB Error: {e}")

if __name__ == "__main__":
    bulk_import()