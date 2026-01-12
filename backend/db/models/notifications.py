from sqlalchemy import Column, Integer, String, DateTime
from db.base import Base
from datetime import datetime

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    symbol = Column(String)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
