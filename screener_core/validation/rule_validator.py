from .error_types import RuleConflictError

def detect_conflicts(rules):
    bounds = {}

    for r in rules:
        m = r["metric"]
        bounds.setdefault(m, {"min": [], "max": []})

        if r["operator"] in (">", ">="):
            bounds[m]["min"].append(r["value"])
        if r["operator"] in ("<", "<="):
            bounds[m]["max"].append(r["value"])

    for metric, b in bounds.items():
        if b["min"] and b["max"] and max(b["min"]) > min(b["max"]):
            raise RuleConflictError(
                f"Unsatisfiable constraints for {metric}"
            )
