from backend.screener_engine.runner import run_screen

def test_runner_executes():
    dsl = {
        "filter": {
            "and": [
                { "field": "pe_ratio", "operator": "<", "value": 100 }
            ]
        }
    }

    results = run_screen(dsl)

    assert isinstance(results, list)
