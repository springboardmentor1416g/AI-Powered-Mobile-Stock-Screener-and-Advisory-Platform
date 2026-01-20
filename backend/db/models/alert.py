from sqlalchemy import Column, Integer, String, JSON, Boolean, DateTime
from db.base import Base
from datetime import datetime

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)
    symbol = Column(String, index=True)
    condition = Column(JSON)  # DSL / JSON
    enabled = Column(Boolean, default=True)
    last_triggered = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)