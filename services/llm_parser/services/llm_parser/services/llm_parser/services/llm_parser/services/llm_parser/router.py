from fastapi import APIRouter, HTTPException
from .service import process_nl_query

router = APIRouter()

@router.post("/parse-query")
def parse_query(query: str):
    try:
        return process_nl_query(query)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
