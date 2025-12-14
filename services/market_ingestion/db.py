import os
from pathlib import Path
import psycopg2
from dotenv import load_dotenv

print("DEBUG: __file__ =", __file__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
dotenv_path = PROJECT_ROOT / ".env"

print("DEBUG: computed .env path =", dotenv_path)
print("DEBUG: .env exists? ->", dotenv_path.exists())

print("DEBUG: BEFORE loading dotenv, DB_URL =", repr(os.environ.get("DB_URL")))

load_dotenv(dotenv_path=str(dotenv_path))

print("DEBUG: AFTER loading dotenv, DB_URL =", repr(os.environ.get("DB_URL")))

DB_URL = os.environ.get("DB_URL")

def test_connection():
    if not DB_URL:
        print("ERROR: DB_URL not set (diagnostic)")
        return
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        cur.execute("SELECT 1;")
        print("DB Connection OK:", cur.fetchone())
        cur.close()
        conn.close()
    except Exception as e:
        print("DB Connection Error:", e)
