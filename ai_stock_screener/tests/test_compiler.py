import unittest
from screener.compiler import ScreenerCompiler
from screener.exceptions import InvalidRuleError

class TestScreenerCompiler(unittest.TestCase):  # Must inherit unittest.TestCase
    def test_parse_valid_rule(self):              # Must start with "test_"
        rule = "price > 100"
        compiled = ScreenerCompiler.parse_rule(rule)
        self.assertEqual(compiled, {"field": "price", "operator": ">", "value": 100.0})

    def test_parse_invalid_operator(self):
        with self.assertRaises(InvalidRuleError):
            ScreenerCompiler.parse_rule("price ! 100")
