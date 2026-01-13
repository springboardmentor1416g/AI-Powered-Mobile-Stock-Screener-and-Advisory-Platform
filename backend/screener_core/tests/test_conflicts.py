import pytest
from screener_core.validation.validator import validate_dsl

def test_unsatisfiable_pe():
    dsl = {
        "conditions": {
            "operator": "AND",
            "rules": [
                {"metric": "PE", "operator": ">", "value": 50},
                {"metric": "PE", "operator": "<", "value": 5}
            ]
        }
    }

    with pytest.raises(Exception):
        validate_dsl(dsl, {}, 10)
