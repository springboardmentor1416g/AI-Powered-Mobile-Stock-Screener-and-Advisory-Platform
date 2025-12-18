from sqlalchemy.orm import Session
from screener.compiler import ScreenerCompiler
from screener.validators import validate_rule_depth
from db.models import Stock

class ScreenerRunner:
    """
    Executes compiled screening rules safely
    """

    def __init__(self, session: Session):
        self.session = session
        self.compiler = ScreenerCompiler()

    def run(self, rule: dict) -> list[dict]:
        validate_rule_depth(rule)

        filter_expression = self.compiler.compile(rule)

        query = (
            self.session
            .query(Stock)
            .filter(filter_expression)
            .limit(500)  # safety cap
        )

        stocks = query.all()

        return [
            {
                "ticker": s.ticker,
                "market_cap": s.market_cap,
                "pe_ratio": s.pe_ratio,
                "dividend_yield": s.dividend_yield,
            }
            for s in stocks
        ]
