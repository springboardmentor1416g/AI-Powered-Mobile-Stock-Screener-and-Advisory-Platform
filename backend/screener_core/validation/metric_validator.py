from screener_core.metrics.registry import DERIVED_METRICS
from .error_types import UnsafeOperationError

def validate_derived(rule, snapshot):
    metric = rule["metric"]

    if metric not in DERIVED_METRICS:
        return

    for dep in DERIVED_METRICS[metric]["inputs"]:
        if snapshot.get(dep) in (None, 0):
            raise UnsafeOperationError(
                f"Invalid input {dep} for {metric}"
            )
