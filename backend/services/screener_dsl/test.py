import json
from validation.validate_dsl import validate_dsl

with open("schema/dsl_schema.json") as f:
    schema = json.load(f)

with open("examples/sample_rules.json") as f:
    dsl = json.load(f)

validate_dsl(dsl, schema)
