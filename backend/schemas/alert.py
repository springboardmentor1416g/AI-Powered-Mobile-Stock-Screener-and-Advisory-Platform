from pydantic import BaseModel
from typing import Dict

class AlertCreate(BaseModel):
    symbol: str
    condition: Dict
    frequency: str = "daily"