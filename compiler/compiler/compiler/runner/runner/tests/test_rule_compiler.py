from compiler.rule_compiler import RuleCompiler

def test_simple_rule():
    compiler = RuleCompiler()
    rule = {
        "field": "price",
        "comparison": ">",
        "value": 100
    }

    sql, params = compiler.compile(rule)
    assert sql == "price > %s"
    assert params == [100]
