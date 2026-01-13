def peg_ratio(pe, eps_growth):
    if eps_growth <= 0:
        raise ValueError("EPS growth must be > 0")
    return pe / eps_growth


def eps_cagr(start, end, years):
    if start <= 0 or years <= 0:
        raise ValueError("Invalid CAGR inputs")
    return (end / start) ** (1 / years) - 1


def fcf_margin(fcf, revenue):
    if revenue <= 0:
        raise ValueError("Revenue must be positive")
    return fcf / revenue
