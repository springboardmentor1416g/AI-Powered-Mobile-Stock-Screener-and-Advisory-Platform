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

