def check_negative_values(symbol, row, numeric_fields):
    warnings = []

    for field in numeric_fields:
        raw_value = row.get(field)

        if raw_value is None or raw_value == "":
            continue

        try:
            value = float(raw_value)
        except ValueError:
            warnings.append(
                f"[WARN] {symbol} - Non-numeric value for '{field}': {raw_value}"
            )
            continue

        if value < 0:
            warnings.append(
                f"[WARN] {symbol} - Negative value detected for '{field}': {value}"
            )

    return warnings
