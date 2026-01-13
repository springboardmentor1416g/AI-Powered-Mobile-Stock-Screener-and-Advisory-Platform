from sqlalchemy import create_engine
import pandas as pd

engine = create_engine("sqlite:///fundamentals.db")

query = """
SELECT symbol, metric, value, period_end
FROM fundamentals_quarterly
LIMIT 20;
"""

df = pd.read_sql(query, engine)
print(df)
