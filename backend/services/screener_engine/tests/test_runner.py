from tests.data.fake_stock_data import FAKE_STOCKS

def run_fake_query(condition):
    results = []

    for stock in FAKE_STOCKS:
        if condition(stock):
            results.append(stock["symbol"])

    return results


def test_runner_positive_profit():
    symbols = run_fake_query(lambda s: s["net_profit"] > 0)

    assert symbols == ["AAA"]


def test_runner_pe_ratio_filter():
    symbols = run_fake_query(lambda s: s["pe_ratio"] < 5)

    assert symbols == ["AAA"]


def test_runner_no_match():
    symbols = run_fake_query(lambda s: s["pe_ratio"] < 1)

    assert symbols == []
