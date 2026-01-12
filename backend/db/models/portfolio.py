from sqlalchemy import Column, Integer, String, Float
from db.base import Base

class PortfolioHolding(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)
    symbol = Column(String, index=True)
    quantity = Column(Float)
    avg_buy_price = Column(Float)
