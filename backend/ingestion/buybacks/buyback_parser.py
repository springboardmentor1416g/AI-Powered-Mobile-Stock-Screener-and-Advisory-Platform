import re

def parse_buyback_text(text):
    patterns = {
        "amount": r"(₹|\$)\s?([\d,]+)",
        "percentage": r"(\d+(\.\d+)?)\s?%"
    }

    amount = re.search(patterns["amount"], text)
    percentage = re.search(patterns["percentage"], text)

    return {
        "buyback_amount": amount.group(2).replace(",", "") if amount else None,
        "buyback_percentage": percentage.group(1) if percentage else None
    }
