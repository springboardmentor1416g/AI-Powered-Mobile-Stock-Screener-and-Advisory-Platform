class ScreenerError(Exception):
    """Base screener exception"""

class UnsupportedFieldError(ScreenerError):
    pass

class UnsupportedOperatorError(ScreenerError):
    pass

class InvalidRuleError(ScreenerError):
    pass
