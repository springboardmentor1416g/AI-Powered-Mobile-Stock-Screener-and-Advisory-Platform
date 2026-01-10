from pydantic import BaseModel
from typing import List

class Condition(BaseModel):
    field: str
    operator: str
    value: float

class DSLQuery(BaseModel):
    conditions: List[Condition]
    logical_operator: str  # AND / OR
    timeframe: str         # e.g. "1Y"
