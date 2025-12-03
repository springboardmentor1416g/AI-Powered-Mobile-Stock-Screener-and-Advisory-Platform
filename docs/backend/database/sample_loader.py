import psycopg2
import pandas as pd
from datetime import datetime, timedelta
import random

class SampleDataLoader:
    def __init__(self, dbname='stock_screener', user='postgres', 
                 password='nagvarshi@2005', host='localhost', port=5432):
        self.conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )
        self.cur = self.conn.cursor()
    
    def load_companies(self):
        """Load sample companies"""
        companies = [
            ('AAPL', 'Apple Inc.', 'Technology', 'Consumer Electronics', 'NASDAQ', 2800000000000),
            ('MSFT', 'Microsoft Corporation', 'Technology', 'Software', 'NASDAQ', 2500000000000),
            ('GOOGL', 'Alphabet Inc.', 'Technology', 'Internet', 'NASDAQ', 1800000000000),
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
    
    def load_price_history(self, ticker, days=365):
        """Generate sample price history"""
        base_price = random.uniform(100, 500)
        start_date = datetime.now() - timedelta(days=days)
        
        dates = pd.date_range(start=start_date, end=datetime.now(), freq='D')
        
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
            volume = random.randint(1000000, 50000000)
            
            insert_query = """
            INSERT INTO price_history (time, ticker, open, high, low, close, volume)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (time, ticker) DO NOTHING;
            """
            
            self.cur.execute(insert_query, (
                date, ticker, round(open_price, 2), round(high, 2),
                round(low, 2), round(close, 2), volume
            ))
            
            prev_close = close
        
        self.conn.commit()
        print(f"Loaded {days} days of price history for {ticker}")
    
    def load_fundamentals(self):
        """Load sample quarterly fundamentals"""
        tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
        quarters = ['2023-Q4', '2024-Q1', '2024-Q2', '2024-Q3']
        
        for ticker in tickers:
            for quarter in quarters:
                revenue = random.randint(50000000000, 150000000000)
                net_income = revenue * random.uniform(0.1, 0.3)
                eps = net_income / random.randint(15000000, 20000000)
                
                insert_query = """
                INSERT INTO fundamentals_quarterly 
                (ticker, quarter, revenue, net_income, eps, operating_margin, roe, roa, pe_ratio, pb_ratio)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                self.cur.execute(insert_query, (
                    ticker, quarter, revenue, net_income, round(eps, 2),
                    round(random.uniform(0.15, 0.35), 3),
                    round(random.uniform(0.1, 0.25), 3),
                    round(random.uniform(0.05, 0.15), 3),
                    round(random.uniform(15, 35), 2),
                    round(random.uniform(2, 8), 2)
                ))
        
        self.conn.commit()
        print("Loaded sample fundamentals")
    
    def run_all(self):
        """Execute all sample data loads"""
        print("Starting sample data load...")
        self.load_companies()
        
        tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
        for ticker in tickers:
            self.load_price_history(ticker, days=90)  # Load 90 days for testing
        
        self.load_fundamentals()
        
        self.cur.close()
        self.conn.close()
        print("Sample data load completed!")

if __name__ == "__main__":
    loader = SampleDataLoader()
    loader.run_all()