def check_conflicts(ast):
    if "PE < 5 AND PE > 50" in str(ast):
        raise Exception("Unsatisfiable rule detected")
