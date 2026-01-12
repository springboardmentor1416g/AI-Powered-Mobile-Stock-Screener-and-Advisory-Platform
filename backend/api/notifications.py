from fastapi import APIRouter
from db.session import SessionLocal
from db.models.notifications import Notification

router = APIRouter(prefix="/notifications")

@router.get("/")
def get_notifications(user_id: int):
    db = SessionLocal()
    return db.query(Notification).filter_by(user_id=user_id).all()
