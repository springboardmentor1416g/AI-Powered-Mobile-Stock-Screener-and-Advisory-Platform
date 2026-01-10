FIELD_MAPPING = {
    "marketCap": "market_cap",
    "peRatio": "pe_ratio",
    "price": "price",
    "volume": "volume"
}

def map_field(dsl_field):
    if dsl_field not in FIELD_MAPPING:
        raise ValueError(f"Unsupported field: {dsl_field}")
    return FIELD_MAPPING[dsl_field]
