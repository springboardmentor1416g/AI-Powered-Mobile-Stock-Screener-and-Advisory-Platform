from .rule_checks import check_conflicts
from .error_types import ValidationError

def validate(ast):
    check_conflicts(ast)
    return True
