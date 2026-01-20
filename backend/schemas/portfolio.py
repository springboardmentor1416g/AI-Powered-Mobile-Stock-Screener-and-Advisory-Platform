from pydantic import BaseModel

class HoldingCreate(BaseModel):
    symbol: str
    quantity: float
    avg_buy_price: float | None = None