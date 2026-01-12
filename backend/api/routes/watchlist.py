from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import SessionLocal
from schemas.watchlist import WatchlistItemCreate
from db.models.watchlist import Watchlist, WatchlistItem
from api.deps import get_current_user_id

router = APIRouter(prefix="/watchlist")

@router.post("/add")
def add_to_watchlist(data: WatchlistItemCreate, user_id=Depends(get_current_user_id)):
    db: Session = SessionLocal()

    watchlist = db.query(Watchlist).filter_by(user_id=user_id).first()
    if not watchlist:
        watchlist = Watchlist(user_id=user_id)
        db.add(watchlist)
        db.commit()

    exists = db.query(WatchlistItem).filter_by(
        watchlist_id=watchlist.id,
        symbol=data.symbol
    ).first()

    if exists:
        return {"status": "already exists"}

    db.add(WatchlistItem(watchlist_id=watchlist.id, symbol=data.symbol))
    db.commit()
    return {"status": "added"}
