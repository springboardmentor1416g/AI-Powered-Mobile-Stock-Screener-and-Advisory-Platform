from sqlalchemy import Column, Integer, String, BigInteger, TIMESTAMP
from sqlalchemy.sql import func
from database import Base   # 👈 IMPORTANT FIX

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    company_name = Column(String)
    sector = Column(String)
    industry = Column(String)
    exchange = Column(String)
    market_cap = Column(BigInteger)
    created_at = Column(TIMESTAMP, server_default=func.now())
