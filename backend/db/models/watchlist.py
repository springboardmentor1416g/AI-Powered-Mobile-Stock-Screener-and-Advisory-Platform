from sqlalchemy import Column, Integer, String
from db.base import Base

class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)
    symbol = Column(String, index=True)