from datetime import datetime
import re

ALLOWED_CURRENCY = {"INR", "USD"}

# -------------------------------
# Helper functions
# -------------------------------

def is_number(value):
    try:
        float(value)
        ret
