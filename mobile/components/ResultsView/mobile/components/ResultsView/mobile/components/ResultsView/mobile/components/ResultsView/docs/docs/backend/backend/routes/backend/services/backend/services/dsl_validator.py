def validate_dsl(dsl):
    required_keys = {"metric", "operator", "value"}
    return required_keys.issubset(dsl.keys())
