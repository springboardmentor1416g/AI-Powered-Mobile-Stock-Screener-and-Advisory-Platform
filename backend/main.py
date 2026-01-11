from fastapi import FastAPI
from services.llm_parser.controller import router as llm_router

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "UP"}

# Versioned API
app.include_router(
    llm_router,
    prefix="/api/v1/llm",
    tags=["LLM Parser v1"]
)

# Legacy (optional, but useful)
app.include_router(
    llm_router,
    prefix="/llm",
    tags=["LLM Parser legacy"]
)
