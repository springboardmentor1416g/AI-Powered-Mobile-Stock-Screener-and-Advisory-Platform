from fastapi import FastAPI
from db.base import Base
from db.session import engine
from api.routes import portfolio, watchlist, alerts

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(portfolio.router)
app.include_router(watchlist.router)
app.include_router(alerts.router)
