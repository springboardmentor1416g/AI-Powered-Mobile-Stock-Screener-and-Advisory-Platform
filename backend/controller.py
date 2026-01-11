from fastapi import APIRouter

router = APIRouter()

@router.post("/parse-query")
def parse_query(payload: dict):
    return {
        "status": "ok",
        "dsl": {
            "intent": "stock_screen",
            "filters": payload
        }
    }
