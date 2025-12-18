from screener.compiler import ScreenerCompiler

def test_simple_condition():
    compiler = ScreenerCompiler()

    rule = {
        "type": "condition",
        "field": "market_cap",
        "operator": ">",
        "value": 1_000_000
    }

    expr = compiler.compile(rule)
    assert expr is not None


def test_nested_group():
    compiler = ScreenerCompiler()

    rule = {
        "type": "group",
        "operator": "AND",
        "conditions": [
            {
                "type": "condition",
                "field": "market_cap",
                "operator": ">",
                "value": 1_000_000
            },
            {
                "type": "group",
                "operator": "OR",
                "conditions": [
                    {
                        "type": "condition",
                        "field": "pe_ratio",
                        "operator": "<",
                        "value": 20
                    },
                    {
                        "type": "condition",
                        "field": "dividend_yield",
                        "operator": ">=",
                        "value": 3
                    }
                ]
            }
        ]
    }

    expr = compiler.compile(rule)
    assert expr is not None
