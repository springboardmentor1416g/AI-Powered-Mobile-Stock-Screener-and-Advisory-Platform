def check_outliers(record):
    """
    record: dict containing financial data for one company/period

    Expected keys:
    - previous_revenue
    - current_revenue
    - previous_price
    - current_price
    - promoter_holding
    """

    anomalies = []

    # -------------------------------
    # 1️⃣ Revenue Spike Check (>300%)
    # -------------------------------
    prev_rev = record.get("previous_revenue")
    curr_rev = record.get("current_revenue")

    if prev_rev is not None and prev_rev > 0 and curr_rev is not None:
        revenue_growth_pct = ((curr_rev - prev_rev) / prev_rev) * 100
        if revenue_growth_pct > 300:
            anomalies.append({
                "rule": "Revenue spike > 300%",
                "severity": "HIGH",
                "value": revenue_growth_pct
            })

    # --------------------------------
    # 2️⃣ Price Jump Check (>40% / day)
    # --------------------------------
    prev_price = record.get("previous_price")
    curr_price = record.get("current_price")

    if prev_price is not None and prev_price > 0 and curr_price is not None:
        price_change_pct = ((curr_price - prev_price) / prev_price) * 100
        if abs(price_change_pct) > 40:
            anomalies.append({
                "rule": "Price jump > 40% in one day",
                "severity": "HIGH",
                "value": price_change_pct
            })

    # ----------------------------------------
    # 3️⃣ Promoter Holding Range Check (0–100)
    # ----------------------------------------
    promoter_holding = record.get("promoter_holding")

    if promoter_holding is not None:
        if promoter_holding < 0 or promoter_holding > 100:
            anomalies.append({
                "rule": "Invalid promoter holding",
                "severity": "HIGH",
                "value": promoter_holding
            })

    # --------------------------------
    # Final Output
    # --------------------------------
    if anomalies:
        return {
            "anomaly_flag": True,
            "manual_review_required": True,
            "issues": anomalies
        }

    return {
        "anomaly_flag": False,
        "manual_review_required": False,
        "issues": []
    }
