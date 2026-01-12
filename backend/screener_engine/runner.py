import psycopg2
from backend.screener_engine.compiler import compile_dsl

def run_screen(dsl):
    where_clause, params = compile_dsl(dsl)

    sql = f"""
        SELECT DISTINCT ticker
        FROM fundamentals_quarterly
        WHERE {where_clause}
    """

    conn = psycopg2.connect(
        host="localhost",
        database="stock_screener",
        user="postgres",
        password="kanan40/80"
    )
    cur = conn.cursor()
    try:
        cur.execute(sql, params)
        results = [row[0] for row in cur.fetchall()]
    except Exception as e:
        raise RuntimeError("Screener execution failed") from e
    finally:
        cur.close()
        conn.close()
    return results
