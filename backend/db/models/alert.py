from sqlalchemy import Column, Integer, String, JSON, Boolean
from db.base import Base

class AlertSubscription(Base):
    __tablename__ = "alert_subscriptions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)
    symbol = Column(String, index=True)
    condition = Column(JSON)
    frequency = Column(String, default="daily")
    active = Column(Boolean, default=True)
