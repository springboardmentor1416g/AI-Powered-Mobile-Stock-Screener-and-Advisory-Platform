def quarter_to_index(q):
    year, quarter = q.split("Q")
    return int(year) * 4 + int(quarter)


def check_quarter_continuity(symbol, quarters):
    """
    quarters: list like ['2023Q1', '2023Q3']
    """
    errors = []
    sorted_q = sorted(quarters, key=quarter_to_index)

    for i in range(1, len(sorted_q)):
        prev_q = sorted_q[i - 1]
        curr_q = sorted_q[i]

        if quarter_to_index(curr_q) - quarter_to_index(prev_q) > 1:
            errors.append(
                f"[ERROR] {symbol} - Missing quarter gap {prev_q} -> {curr_q}"
            )

    return errors
