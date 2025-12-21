import json
from compiler.dsl_to_sql import compile_dsl_to_sql

dsl = {
  "filter": {
    "and": [
      {"field": "pe_ratio", "operator": "<", "value": 5},
      {"field": "promoter_holding", "operator": ">", "value": 50}
    ]
  }
}

sql, params = compile_dsl_to_sql(dsl)

print(sql)
print(params)
