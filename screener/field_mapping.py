from db.models import Stock

DSL_FIELD_MAP = {
    "market_cap": Stock.market_cap,
    "pe_ratio": Stock.pe_ratio,
    "dividend_yield": Stock.dividend_yield,
    "ticker": Stock.ticker,
}
