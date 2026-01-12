from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import SessionLocal
from schemas.alert import AlertCreate
from db.models.alert import AlertSubscription
from api.deps import get_current_user_id
from services.alert_validator import validate_alert_condition

router = APIRouter(prefix="/alerts")

@router.post("/create")
def create_alert(data: AlertCreate, user_id=Depends(get_current_user_id)):
    try:
        validate_alert_condition(data.condition)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    db: Session = SessionLocal()
    alert = AlertSubscription(
        user_id=user_id,
        symbol=data.symbol,
        condition=data.condition,
        frequency=data.frequency
    )
    db.add(alert)
    db.commit()
    return {"status": "created"}
