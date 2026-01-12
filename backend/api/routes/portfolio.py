from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import SessionLocal
from schemas.portfolio import HoldingCreate
from db.models.portfolio import Portfolio, PortfolioHolding
from api.deps import get_current_user_id

router = APIRouter(prefix="/portfolio")

@router.post("/add")
def add_stock(data: HoldingCreate, user_id=Depends(get_current_user_id)):
    db: Session = SessionLocal()

    portfolio = db.query(Portfolio).filter_by(user_id=user_id).first()
    if not portfolio:
        portfolio = Portfolio(user_id=user_id)
        db.add(portfolio)
        db.commit()

    holding = PortfolioHolding(
        portfolio_id=portfolio.id,
        symbol=data.symbol,
        quantity=data.quantity,
        avg_buy_price=data.avg_buy_price
    )
    db.add(holding)
    db.commit()
    return {"status": "added"}
