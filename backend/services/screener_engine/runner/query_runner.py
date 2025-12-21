import psycopg2

def run_query(sql, params):
    conn = psycopg2.connect(
        host="localhost",
        dbname="stocks",
        user="postgres",
        password="password"
    )

    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()

            results = []
            for row in rows:
                results.append({
                    "symbol": row[0],
                    "company_name": row[1]
                })

            return results

    finally:
        conn.close()
