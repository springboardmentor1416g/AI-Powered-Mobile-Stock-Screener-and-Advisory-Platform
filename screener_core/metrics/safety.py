def ensure_positive(value, name):
    if value is None or value <= 0:
        raise ValueError(f"{name} must be positive")
