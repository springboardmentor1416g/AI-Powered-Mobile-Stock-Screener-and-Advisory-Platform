import unittest
from screener.compiler import ScreenerCompiler
from screener.runner import ScreenerRunner
from tests.test_data import SAMPLE_STOCKS

class TestScreenerRunner(unittest.TestCase):
    def test_rule_matching(self):
        rule = "price > 200"
        compiled = ScreenerCompiler.parse_rule(rule)
        matches = [stock["symbol"] for stock in SAMPLE_STOCKS if ScreenerRunner.execute_rule(stock, compiled)]
        self.assertEqual(set(matches), {"TSLA", "MSFT"})

    def test_rule_no_match(self):
        rule = "price > 1000"
        compiled = ScreenerCompiler.parse_rule(rule)
        matches = [stock["symbol"] for stock in SAMPLE_STOCKS if ScreenerRunner.execute_rule(stock, compiled)]
        self.assertEqual(matches, [])

    def test_edge_case_zero(self):
        rule = "price == 0"
        compiled = ScreenerCompiler.parse_rule(rule)
        matches = [stock["symbol"] for stock in SAMPLE_STOCKS if ScreenerRunner.execute_rule(stock, compiled)]
        self.assertEqual(matches, ["XYZ"])

if __name__ == "__main__":
    unittest.main()
