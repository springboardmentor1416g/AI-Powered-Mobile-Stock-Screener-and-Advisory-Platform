def ingest_earnings_calendar(events):
    return [
        {
            "company_id": e["company_id"],
            "earnings_date": e["date"],
            "fiscal_year": e["fy"],
            "fiscal_quarter": e["fq"],
            "status": e.get("status", "estimated")
        }
        for e in events
    ]
