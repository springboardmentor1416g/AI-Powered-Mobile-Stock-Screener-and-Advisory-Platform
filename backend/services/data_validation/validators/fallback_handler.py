from datetime import datetime
import pandas as pd

# -------------------------------
# Helper functions
# -------------------------------

def auto_convert_date(date_str, date_format="%Y-%m-%d"):
    """Convert string to datetime object if possible"""
    try:
        return datetime.strptime(date_str, date_format)
    except (ValueError, TypeError):
        return None

def impute_missing(value, default_value):
    """Return default if value is None or NaN"""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return default_value
    return value

def keep_latest(df, company_col="company_name", date_col="report_date"):
    """Keep only the latest row per company based on date_col"""
    df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    df = df.sort_values(by=[company_col, date_col], ascending=[True, False])
    latest_df = df.drop_duplicates(subset=[company_col], keep="first")
    return latest_df

def handle_fallback(record, mandatory_fields=None, impute_values=None):
    """
    record: dict of a single company's data
    mandatory_fields: list of fields that must exist
    impute_values: dict of default values for optional fields
    """

    if mandatory_fields is None:
        mandatory_fields = ["revenue", "eps", "ebitda"]

    if impute_values is None:
        impute_values = {}

    # -------------------------------
    # 1️⃣ Check mandatory fields
    # -------------------------------
    for field in mandatory_fields:
        if record.get(field) is None:
            # Skip company if critical field missing
            return {
                "action": "skip",
                "reason": f"Mandatory field {field} missing",
                "record": record
            }

    # -------------------------------
    # 2️⃣ Impute optional fields
    # -------------------------------
    for field, default in impute_values.items():
        record[field] = impute_missing(record.get(field), default)

    # -------------------------------
    # 3️⃣ Auto-convert date fields
    # -------------------------------
    for field in record:
        if "date" in field.lower():
            record[field] = auto_convert_date(record[field])

    # -------------------------------
    # 4️⃣ Keep latest handled outside if batch (use keep_latest)
    # -------------------------------

    return {
        "action": "processed",
        "record": record
    }
