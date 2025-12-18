from sqlalchemy import Column, Integer, Float, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True)
    ticker = Column(String, index=True, nullable=False)

    market_cap = Column(Float, index=True)
    pe_ratio = Column(Float, index=True)
    dividend_yield = Column(Float, index=True)
