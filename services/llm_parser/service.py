from services.llm_parser.llm_client import parse_nl_to_dsl
from services.llm_parser.dsl_validator import validate_dsl
from screener.compiler import compile_dsl
from screener.runner import run_screener

def process_nl_query(nl_query: str):
    dsl_raw = parse_nl_to_dsl(nl_query)
    validated_dsl = validate_dsl(dsl_raw)

    compiled_query = compile_dsl(validated_dsl)
    return run_screener(compiled_query)
