import os
import logging
import pandas as pd
from datetime import datetime

RAW_SOURCE = "data/raw/fundamentals"
OUT_DIR = "data/processed/fundamentals"
LOG_DIR = "logs"

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

log_file = f"{LOG_DIR}/ingestion_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def normalize(df):
    rename_map = {
        "Revenue": "revenue",
        "Net Income": "net_income",
        "EBITDA": "ebitda",
        "Total Debt": "total_debt",
        "Free Cash Flow": "fcf"
    }
    df = df.rename(columns=rename_map)
    df["currency"] = "USD"
    df["period"] = pd.to_datetime(df["period"])
    return df

def ingest():
    logging.info("Starting fundamentals ingestion")

    all_frames = []

    for file in os.listdir(RAW_SOURCE):
        if file.endswith(".csv"):
            df = pd.read_csv(os.path.join(RAW_SOURCE, file))
            df = normalize(df)
            all_frames.append(df)

    final_df = pd.concat(all_frames)
    output_file = f"{OUT_DIR}/fundamentals_normalized.csv"
    final_df.to_csv(output_file, index=False)

    logging.info(f"Ingestion completed. Rows: {len(final_df)}")

if __name__ == "__main__":
    ingest()
