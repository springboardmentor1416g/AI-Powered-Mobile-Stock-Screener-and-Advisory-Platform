from ingestion.common.normalizer import normalize_currency
from ingestion.common.validator import validate_price_targets
from ingestion.common.ingestion_logger import log_event

def ingest_analyst_data(raw_payload):
    normalized = []
    for r in raw_payload:
        record = {
            "company_id": r["company_id"],
            "low_target": normalize_currency(r["low"]),
            "average_target": normalize_currency(r["avg"]),
            "high_target": normalize_currency(r["high"]),
            "analyst_count": r.get("analysts", 0),
            "updated_at": r.get("date")
        }
        validate_price_targets(record)
        normalized.append(record)

    log_event("Analyst ingestion completed", len(normalized))
    return normalized
