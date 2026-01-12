from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from db.base import Base

class Portfolio(Base):
    __tablename__ = "user_portfolios"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)
    created_at = Column(DateTime, server_default=func.now())


class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"

    id = Column(Integer, primary_key=True)
    portfolio_id = Column(Integer, ForeignKey("user_portfolios.id"))
    symbol = Column(String, index=True)
    quantity = Column(Float)
    avg_buy_price = Column(Float, nullable=True)
