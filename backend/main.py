from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Company

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "UP"}

@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    return {"db": "connected"}

@app.get("/metadata/stocks")
def get_stocks(db: Session = Depends(get_db)):
    stocks = db.query(Company).all()

    return [
        {
            "symbol": stock.symbol,
            "company_name": stock.company_name,
            "sector": stock.sector,
            "market_cap": stock.market_cap
        }
        for stock in stocks
    ]
