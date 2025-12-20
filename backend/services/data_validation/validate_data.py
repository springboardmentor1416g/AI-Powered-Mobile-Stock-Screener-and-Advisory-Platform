"""
Main Validation Script
Path: services/data_validation/validate_data.py
Runs all validation checks before DB load
"""

import os
import logging
from datetime import datetime

# Import rule modules
from rules.missing_data_rules import check_missing_data
from rules.outlier_rules import detect_outliers
from rules.quarter_continuity import check_quarter_continuity
from rules.schema_validation import validate_schema
from validators.fallback_handler import apply_fallback

# -----------------------------
# Setup Logging
# -----------------------------
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

log_file = os.path.join(
    LOG_DIR, f"validation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
)

logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format="[%(levelname)s] %(message)s"
)

# -----------------------------
# Main Validation Function
# -----------------------------

def validate_company_data(company_symbol: str, data: dict):
    """
    Validates a single company's data
    :param company_symbol: Stock symbol (e.g., TCS)
    :param data: Company fundamentals & price data
    :return: (is_valid, issues)
    """

    issues = []

    # 1. Schema Validation
    schema_issues = validate_schema(data)
    issues.extend(schema_issues)

    # 2. Missing Data Checks
    missing_issues = check_missing_data(data)
    issues.extend(missing_issues)

    # 3. Quarter Continuity Check
    quarter_issues = check_quarter_continuity(data)
    issues.extend(quarter_issues)

    # 4. Outlier Detection
    outlier_issues = detect_outliers(data)
    issues.extend(outlier_issues)

    # Log issues
    for issue in issues:
        level = issue.get("severity", "INFO")
        message = f"{company_symbol} - {issue['message']}"

        if level == "HIGH":
            logging.error(message)
        elif level == "MEDIUM":
            logging.warning(message)
        else:
            logging.info(message)

    # Apply fallback actions
    cleaned_data, blocking_issues = apply_fallback(data, issues)

    if blocking_issues:
        logging.error(f"{company_symbol} - Validation failed. Blocking DB load")
        return False, cleaned_data, issues

    logging.info(f"{company_symbol} - Validation passed")
    return True, cleaned_data, issues


# -----------------------------
# Entry Point
# -----------------------------

def run_validation(all_companies_data: dict):
    """
    Runs validation for all companies
    :param all_companies_data: Dict of symbol -> data
    :return: validated data
    """

    validated_data = {}

    for symbol, data in all_companies_data.items():
        is_valid, clean_data, issues = validate_company_data(symbol, data)

        if is_valid:
            validated_data[symbol] = clean_data

    return validated_data


# -----------------------------
# For Manual Testing
# -----------------------------

if __name__ == "__main__":
    # Example dummy input (replace with ingestion output)
    sample_data = {
        "TCS": {
            "quarters": ["2023-Q1", "2023-Q2", "2023-Q3"],
            "revenue": [100, 110, 115],
            "ebitda": [30, None, 35],
            "price": [3200, 4500, 3300],
            "currency": "INR"
        }
    }

    result = run_validation(sample_data)
    print("Validated Companies:", list(result.keys()))