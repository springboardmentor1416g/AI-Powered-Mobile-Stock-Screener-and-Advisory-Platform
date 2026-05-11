from pydantic import BaseModel

class WatchlistItemCreate(BaseModel):
    symbol: str