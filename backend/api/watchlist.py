from fastapi import APIRouter
from db.session import SessionLocal
from db.models.watchlist import Watchlist

router = APIRouter(prefix="/watchlist")

@router.get("/")
def get_watchlist(user_id: int):
    db = SessionLocal()
    return db.query(Watchlist).filter_by(user_id=user_id).all()

@router.post("/")
def add_stock(user_id: int, symbol: str):
    db = SessionLocal()
    item = Watchlist(user_id=user_id, symbol=symbol)
    db.add(item)
    db.commit()
    return {"status": "added"}

@router.delete("/{id}")
def remove_stock(id: int):
    db = SessionLocal()
    db.query(Watchlist).filter_by(id=id).delete()
    db.commit()
    return {"status": "removed"}
