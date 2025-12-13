"""
fundamentals_ingest.py
Ingest quarterly/annual fundamentals from CSV or API and normalize before inserting into DB.

Assumptions:
- CSV (or API JSON) fields may vary; normalization maps multiple source field names to canonical names.
- Produced tables: fundamentals_quarterly, fundamentals_annual, metrics_normalized (optional)
"""

import os
import csv
import logging
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values

load_dotenv()
LOG = logging.getLogger("fundamentals_ingest")
LOG.setLevel(os.getenv("LOG_LEVEL", "INFO"))

DATABASE_URL = os.getenv("DATABASE_URL")
RAW_PATH = os.getenv("RAW_STORAGE_PATH", "./storage/raw")
PROCESSED_PATH = os.getenv("PROCESSED_PATH", "./data/processed/fundamentals")

Path(PROCESSED_PATH).mkdir(parents=True, exist_ok=True)

# canonical field names we will store
CANONICAL_QUARTER_FIELDS = [
    "ticker", "fiscal_year", "quarter", "period_start", "period_end",
    "revenue", "gross_profit", "ebitda", "operating_income", "net_income",
    "eps", "operating_margin", "roe", "roa", "pe_ratio", "pb_ratio"
]

# Map typical source names to canonical ones
FIELD_MAP = {
    # revenue
    "revenue": "revenue",
    "totalRevenue": "revenue",
    "Revenue": "revenue",
    # net income
    "netIncome": "net_income",
    "Net Income": "net_income",
    # eps
    "eps": "eps",
    "basicEPS": "eps",
    # ebitda
    "ebitda": "ebitda",
    # fiscal year/period
    "fiscalYear": "fiscal_year",
    "periodEnd": "period_end",
    "periodStart": "period_start",
    # ticker identifiers
    "ticker": "ticker",
    "symbol": "ticker",
    # add more mappings as needed
}

def normalize_row(src_row: dict) -> dict:
    row = {}
    # normalize keys using FIELD_MAP (case-insensitive)
    for k, v in src_row.items():
        if v is None or v == "":
            continue
        key_lower = k.strip()
        mapped = FIELD_MAP.get(key_lower) or FIELD_MAP.get(k) or FIELD_MAP.get(k.replace(" ", "")) or k.lower()
        # attempt to coerce numbers
        val = v.strip()
        # basic cleanup for currency and units
        val = val.replace(",", "")
        # convert known fields
        if mapped in ("revenue", "net_income", "ebitda", "gross_profit"):
            try:
                row[mapped] = int(float(val))
            except Exception:
                row[mapped] = None
        elif mapped in ("eps", "operating_margin", "roe", "roa", "pe_ratio", "pb_ratio"):
            try:
                row[mapped] = float(val)
            except Exception:
                row[mapped] = None
        elif mapped in ("fiscal_year",):
            try:
                row[mapped] = int(val)
            except:
                row[mapped] = None
        elif mapped in ("period_end", "period_start"):
            try:
                row[mapped] = datetime.fromisoformat(val).date()
            except:
                # try other formats
                try:
                    from dateutil.parser import parse
                    row[mapped] = parse(val).date()
                except:
                    row[mapped] = None
        else:
            row[mapped] = val
    # ensure ticker present
    if 'ticker' not in row and 'symbol' in src_row:
        row['ticker'] = src_row.get('symbol')
    return row

def insert_quarterly(rows: list):
    if not rows:
        return
    conn = psycopg2.connect(DATABASE_URL)
    insert_sql = """
    INSERT INTO fundamentals_quarterly
    (ticker, fiscal_year, quarter, period_start, period_end, revenue, gross_profit, operating_income, net_income, eps, operating_margin, roe, roa, pe_ratio, pb_ratio, created_at)
    VALUES %s
    ON CONFLICT DO NOTHING;
    """
    values = []
    for r in rows:
        values.append((
            r.get('ticker'),
            r.get('fiscal_year'),
            r.get('quarter'),
            r.get('period_start'),
            r.get('period_end'),
            r.get('revenue'),
            r.get('gross_profit'),
            r.get('operating_income'),
            r.get('net_income'),
            r.get('eps'),
            r.get('operating_margin'),
            r.get('roe'),
            r.get('roa'),
            r.get('pe_ratio'),
            r.get('pb_ratio'),
            datetime.now(timezone.utc)
        ))
    with conn.cursor() as cur:
        execute_values(cur, insert_sql, values, page_size=500)
    conn.commit()
    conn.close()
    LOG.info("Inserted %d fundamentals rows", len(values))

def ingest_from_csv(path: str):
    LOG.info("Ingesting fundamentals from CSV: %s", path)
    rows = []
    with open(path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for r in reader:
            norm = normalize_row(r)
            # derive quarter string if possible
            if 'period_end' in norm and norm['period_end']:
                dt = norm['period_end']
                q = (dt.month - 1) // 3 + 1
                norm['quarter'] = f"Q{q}"
            rows.append(norm)
    # optionally save normalized CSV
    out_file = Path(PROCESSED_PATH) / (Path(path).stem + ".normalized.csv")
    with open(out_file, 'w', newline='', encoding='utf-8') as outcsv:
        writer = csv.DictWriter(outcsv, fieldnames=CANONICAL_QUARTER_FIELDS)
        writer.writeheader()
        for r in rows:
            writer.writerow({k: r.get(k) for k in CANONICAL_QUARTER_FIELDS})
    LOG.info("Wrote normalized CSV to %s", out_file)
    insert_quarterly(rows)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", help="Path to source CSV")
    args = parser.parse_args()
    if not args.csv:
        LOG.error("Please provide --csv path")
    else:
        ingest_from_csv(args.csv)
