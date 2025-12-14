def check_nulls(symbol, row, required_fields):
    errors = []

    for field in required_fields:
        if row.get(field) is None:
            errors.append(
                f"[ERROR] {symbol} - NULL value for field '{field}'"
            )

    return errors
