from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:password@localhost:5432/stocks"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    statement_timeout=5000  # safety timeout (ms)
)

SessionLocal = sessionmaker(bind=engine)
