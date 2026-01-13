from .rule_validator import detect_conflicts
from .metric_validator import validate_derived
from .data_validator import validate_period_availability

def validate_dsl(dsl, snapshot, available_periods):
    rules = dsl["conditions"]["rules"]

    detect_conflicts(rules)

    for r in rules:
        validate_period_availability(r, available_periods)
        validate_derived(r, snapshot)

    return True
