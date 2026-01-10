def compute_peg(pe, eps_growth):
    if eps_growth <= 0:
        raise ValueError("Invalid EPS growth")
    return pe / eps_growth
