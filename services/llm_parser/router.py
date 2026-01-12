from fastapi import APIRouter, HTTPException
from services.llm_parser.models import NLQueryRequest, ScreenerResponse
from services.llm_parser.service import process_nl_query

router = APIRouter(prefix="/llm-parser", tags=["LLM Parser"])

@router.post("/query", response_model=ScreenerResponse)
def handle_query(request: NLQueryRequest):
    try:
        results = process_nl_query(request.query)
        return ScreenerResponse(
            request_id=request.request_id,
            results=results
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
