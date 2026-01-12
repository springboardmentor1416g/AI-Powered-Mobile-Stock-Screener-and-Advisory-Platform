from datetime import datetime

def to_year_label(date_str: str) -> str:
    # e.g. '2024-09-30' -> '2024'
    return str(datetime.fromisoformat(date_str).year)

def to_quarter_label(date_str: str) -> str:
    # e.g. '2024-09-30' -> '2024-Q3'
    d = datetime.fromisoformat(date_str)
    q = (d.month - 1) // 3 + 1
    return f"{d.year}-Q{q}"
