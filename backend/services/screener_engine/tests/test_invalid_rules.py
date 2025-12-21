import pytest
from compiler.dsl_to_sql import compile_dsl_to_sql

def test_invalid_operator():
    dsl = {
        "filter": {
            "field": "pe_ratio",
            "operator": "LIKE",
            "value": 5
        }
    }

    with pytest.raises(Exception):
        compile_dsl_to_sql(dsl)


def test_missing_field():
    dsl = {
        "filter": {
            "operator": "<",
            "value": 5
        }
    }

    with pytest.raises(Exception):
        compile_dsl_to_sql(dsl)
