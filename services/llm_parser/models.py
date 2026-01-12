from pydantic import BaseModel
from typing import List, Optional

class NLQueryRequest(BaseModel):
    query: str
    request_id: Optional[str]

class Condition(BaseModel):
    field: str
    operator: str
    value: float

class DSLQuery(BaseModel):
    universe: str
    conditions: List[Condition]
    sort_by: Optional[str]
    limit: Optional[int]

class ScreenerResponse(BaseModel):
    request_id: Optional[str]
    results: list
