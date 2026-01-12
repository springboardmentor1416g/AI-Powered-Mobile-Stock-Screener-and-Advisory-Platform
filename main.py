from fastapi import FastAPI
from services.llm_parser.router import router

app = FastAPI(title="AI Stock Screener Backend")
app.include_router(router)
