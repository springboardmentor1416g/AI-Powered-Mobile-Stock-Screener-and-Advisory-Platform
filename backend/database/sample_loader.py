import os
import random
from datetime import datetime, timedelta

import pandas as pd
import psycopg2


class SampleDataLoader:
    def __init__(self) -> None:
        """
        Connect to PostgreSQL using environment variables, with safe defaults.
        """
        dbname = os.getenv("DB_NAME", "stock_screener")
        user = os.getenv("DB_USER", "postgres")
        password = os.getenv("DB_PASSWORD", "postgres")
        host = os.getenv("DB_HOST", "localhost")
        port = int(os.getenv("DB_PORT", "5432"))

        self.conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port,
        )
        self.cur = self.conn.cursor()

    # ---------------------------------------------------------
    # Companies
    # ---------------------------------------------------------
    def load_companies(self) -> None:
        """Load sample companies into the `companies` table."""
        companies = [
            ('AAPL', 'Apple Inc.', 'Technology', 'Consumer Electronics', 'NASDAQ', 2800000000000),
            ('MSFT', 'Microsoft Corporation', 'Technology', 'Software', 'NASDAQ', 2500000000000),
            ('GOOGL', 'Alphabet Inc.', 'Technology', 'Internet Services', 'NASDAQ', 1800000000000),
            ('AMZN', 'Amazon.com Inc.', 'Consumer Cyclical', 'E-commerce', 'NASDAQ', 1500000000000),
            ('TSLA', 'Tesla Inc.', 'Consumer Cyclical', 'Auto Manufacturers', 'NASDAQ', 800000000000),
            ('JPM', 'JPMorgan Chase & Co.', 'Financial', 'Banks', 'NYSE', 450000000000),
            ('JNJ', 'Johnson & Johnson', 'Healthcare', 'Pharmaceuticals', 'NYSE', 400000000000),
        ]

        insert_query = """
        INSERT INTO companies (ticker, name, sector, industry, exchange, market_cap)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (ticker) DO NOTHING;
        """

        for company in companies:
            self.cur.execute(insert_query, company)

        self.conn.commit()
        print(f"Loaded {len(companies)} companies")

    # ---------------------------------------------------------
    # Price History
    # ---------------------------------------------------------
    def load_price_history(self, ticker: str, days: int = 365) -> None:
        """
        Generate synthetic daily OHLCV for the given ticker over `days` days.
        Writes into `price_history` table.
        """
        base_price = random.uniform(100, 500)
        start_date = datetime.now() - timedelta(days=days)

        dates = pd.date_range(start=start_date, end=datetime.now(), freq='D')
        prev_close = base_price

        for i, date in enumerate(dates):
            # Simulate price movement
            volatility = random.uniform(-0.03, 0.03)
            if i == 0:
                close = base_price
            else:
                close = prev_close * (1 + volatility)

            open_price = close * random.uniform(0.98, 1.02)
            high = max(open_price, close) * random.uniform(1.0, 1.05)
            low = min(open_price, close) * random.uniform(0.95, 1.0)
            volume = random.randint(1_000_000, 50_000_000)

            insert_query = """
            INSERT INTO price_history (time, ticker, open, high, low, close, volume)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (time, ticker) DO NOTHING;
            """

            self.cur.execute(
                insert_query,
                (
                    date.to_pydatetime(),
                    ticker,
                    round(open_price, 2),
                    round(high, 2),
                    round(low, 2),
                    round(close, 2),
                    volume,
                ),
            )

            prev_close = close

        self.conn.commit()
        print(f"Loaded {len(dates)} days of price history for {ticker}")

    # ---------------------------------------------------------
    # Fundamentals
    # ---------------------------------------------------------
    def load_fundamentals(self) -> None:
        """Load sample quarterly fundamentals into `fundamentals_quarterly`."""
        tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
        quarters = ['2023-Q4', '2024-Q1', '2024-Q2', '2024-Q3']

        for ticker in tickers:
            for quarter in quarters:
                revenue = random.randint(50_000_000_000, 150_000_000_000)
                net_income = int(revenue * random.uniform(0.1, 0.3))
                eps = net_income / random.randint(15_000_000, 20_000_000)

                insert_query = """
                INSERT INTO fundamentals_quarterly 
                (ticker, quarter, revenue, net_income, eps, 
                 operating_margin, roe, roa, pe_ratio, pb_ratio)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                self.cur.execute(
                    insert_query,
                    (
                        ticker,
                        quarter,
                        revenue,
                        net_income,
                        round(eps, 2),
                        round(random.uniform(0.15, 0.35), 3),   # operating_margin
                        round(random.uniform(0.10, 0.25), 3),   # roe
                        round(random.uniform(0.05, 0.15), 3),   # roa
                        round(random.uniform(15, 35), 2),       # pe_ratio
                        round(random.uniform(2, 8), 2),         # pb_ratio
                    ),
                )

        self.conn.commit()
        print("Loaded sample quarterly fundamentals")

    # ---------------------------------------------------------
    # Analyst Estimates
    # ---------------------------------------------------------
    def load_analyst_estimates(self) -> None:
        """Load sample analyst estimates into `analyst_estimates`."""
        tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']

        for ticker in tickers:
            eps_estimate = round(random.uniform(3, 10), 2)
            revenue_estimate = random.randint(50_000_000_000, 200_000_000_000)
            pt_low = round(random.uniform(100, 300), 2)
            pt_avg = round(pt_low * random.uniform(1.05, 1.20), 2)
            pt_high = round(pt_avg * random.uniform(1.05, 1.20), 2)

            insert_query = """
            INSERT INTO analyst_estimates (
                ticker, estimate_date, eps_estimate, revenue_estimate,
                price_target_low, price_target_avg, price_target_high, analyst_rating
            )
            VALUES (%s, CURRENT_DATE, %s, %s, %s, %s, %s, %s)
            """

            rating = random.choice(["BUY", "HOLD", "SELL"])
            self.cur.execute(
                insert_query,
                (
                    ticker,
                    eps_estimate,
                    revenue_estimate,
                    pt_low,
                    pt_avg,
                    pt_high,
                    rating,
                ),
            )

        self.conn.commit()
        print("Loaded sample analyst estimates")

    # ---------------------------------------------------------
    # Buybacks
    # ---------------------------------------------------------
    def load_buybacks(self) -> None:
        """Load sample buyback announcements into `buybacks`."""
        tickers = ['AAPL', 'MSFT', 'GOOGL']

        for ticker in tickers:
            amount = random.randint(1_000_000_000, 10_000_000_000)
            remarks = f"Sample buyback program for {ticker}"

            insert_query = """
            INSERT INTO buybacks (ticker, announcement_date, amount, remarks)
            VALUES (%s, CURRENT_DATE, %s, %s)
            """

            self.cur.execute(insert_query, (ticker, amount, remarks))

        self.conn.commit()
        print("Loaded sample buybacks")

    # ---------------------------------------------------------
    # Orchestration
    # ---------------------------------------------------------
    def run_all(self) -> None:
        """Execute all sample data loads in order."""
        print("Starting sample data load...")
        self.load_companies()

        tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
        for ticker in tickers:
            self.load_price_history(ticker, days=90)  # 90 days of history for testing

        self.load_fundamentals()
        self.load_analyst_estimates()
        self.load_buybacks()

        self.cur.close()
        self.conn.close()
        print("Sample data load completed!")


if __name__ == "__main__":
    loader = SampleDataLoader()
    loader.run_all()
