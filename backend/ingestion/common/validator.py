def validate_price_targets(record):
    if not (record["low_target"] <= record["average_target"] <= record["high_target"]):
        raise ValueError("Invalid price target range")
