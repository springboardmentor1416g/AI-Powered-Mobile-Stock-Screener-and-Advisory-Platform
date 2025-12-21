"""
schema_validation.py

Purpose:
Validate data schema for correctness.

Checks:
1. Numbers are numeric
2. Dates are valid
3. Currency is only INR or USD
4. Strings don’t contain symbols

If any rule fails:
→ Flag issue
→ Mark for manual review
"""

from datetime import datetime
import re

ALLOWED_CURRENCY = {"INR", "USD"}

# -------------------------------
# Helper functions
# -------------------------------

def is_number(value):
    try:
        float(value)
        return True
    except (ValueError, TypeError):
        return False

def is_valid_date(value, date_format="%Y-%m-%d"):
    try:
        datetime.strptime(value, date_format)
        return True
    except (ValueError, TypeError):
        return False

def is_valid_currency(value):
    return value in ALLOWED_CURRENCY

def has_no_symbols(value):
    if not isinstance(value, str):
        return False
    # Only allow letters, numbers, spaces
    return bool(re.match(r'^[a-zA-Z0-9\s]+$', value))

# -------------------------------
# Main validation function
# -------------------------------

def validate_schema(record):
    """
    record: dict containing data fields
    Example:
    {
        "revenue": 1000,
        "report_date": "2023-12-31",
        "currency": "INR",
        "company_name": "ABC Ltd"
    }
    """

    issues = []

    for field, value in record.items():
        # Check numbers
        if isinstance(value, (int, float)) or field.lower() in ["revenue", "eps", "ebitda", "price"]:
            if not is_number(value):
                issues.append({
                    "rule": "Numeric check",
                    "severity": "HIGH",
                    "field": field,
                    "value": value
                })

        # Check dates
        if "date" in field.lower():
            if not is_valid_date(value):
                issues.append({
                    "rule": "Date validity check",
                    "severity": "HIGH",
                    "field": field,
                    "value": value
                })

        # Check currency
        if "currency" in field.lower():
            if not is_valid_currency(value):
                issues.append({
                    "rule": "Currency check",
                    "severity": "HIGH",
                    "field": field,
                    "value": value
                })

        # Check strings for symbols
        if isinstance(value, str) and not "currency" in field.lower() and not "date" in field.lower():
            if not has_no_symbols(value):
                issues.append({
                    "rule": "String symbol check",
                    "severity": "MEDIUM",
                    "field": field,
                    "value": value
                })

    if issues:
        return {
            "valid": False,
            "manual_review_required": True,
            "issues": issues
        }

    return {
        "valid": True,
        "manual_review_required": False,
        "issues": []
    }
