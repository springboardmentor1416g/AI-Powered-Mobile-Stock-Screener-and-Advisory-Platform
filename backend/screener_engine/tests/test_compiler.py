from backend.screener_engine.compiler import compile_dsl

def test_single_condition():
    dsl = {
        "filter": {
            "and": [
                { "field": "pe_ratio", "operator": "<", "value": 10 }
            ]
        }
    }

    where, params = compile_dsl(dsl)

    assert "pe_ratio < %s" in where
    assert params == [10]


def test_and_conditions():
    dsl = {
        "filter": {
            "and": [
                { "field": "pe_ratio", "operator": "<", "value": 10 },
                { "field": "promoter_holding", "operator": ">", "value": 50 }
            ]
        }
    }

    where, params = compile_dsl(dsl)

    assert "AND" in where
    assert params == [10, 50]


def test_invalid_operator():
    dsl = {
        "filter": {
            "and": [
                { "field": "pe_ratio", "operator": "LIKE", "value": 10 }
            ]
        }
    }

    try:
        compile_dsl(dsl)
        assert False
    except ValueError:
        assert True

def test_unknown_field():
    dsl = {
        "filter": {
            "and": [
                { "field": "unknown_metric", "operator": "<", "value": 10 }
            ]
        }
    }

    try:
        compile_dsl(dsl)
        assert False
    except ValueError:
        assert True

