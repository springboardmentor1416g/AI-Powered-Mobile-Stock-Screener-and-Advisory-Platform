from .error_types import MetricUnavailableError

def validate_period_availability(rule, available_periods):
    required = rule.get("period", {}).get("last")
    if required and available_periods < required:
        raise MetricUnavailableError("Insufficient historical data")
