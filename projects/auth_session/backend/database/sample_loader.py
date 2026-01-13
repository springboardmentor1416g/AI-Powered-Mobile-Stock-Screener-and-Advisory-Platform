"""
Sample Data Loader for Stock Screener Database
This script demonstrates how sample data could be inserted
into the database tables.
"""

def load_sample_data():
    companies = [
        ("TCS", "Tata Consultancy Services", "IT", "Software", "NSE", 120000000000),
        ("INFY", "Infosys", "IT", "Software", "NSE", 80000000000)
    ]

    fundamentals = [
        ("TCS", "2024-Q1", 60000000000, 12000000000, 28.5),
        ("INFY", "2024-Q1", 45000000000, 9000000000, 26.1)
    ]

    print("Sample companies:", companies)
    print("Sample fundamentals:", fundamentals)

if __name__ == "__main__":
    load_sample_data()
