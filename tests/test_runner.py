from screener.runner import ScreenerRunner

def test_runner_empty_result(db_session):
    runner = ScreenerRunner(db_session)

    rule = {
        "type": "condition",
        "field": "market_cap",
        "operator": ">",
        "value": 10**15
    }

    results = runner.run(rule)
    assert isinstance(results, list)
