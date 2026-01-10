from runner.db_connection import get_connection

class QueryRunner:
    def run(self, where_clause, params):
        query = f"""
        SELECT symbol, price, market_cap
        FROM stocks
        WHERE {where_clause}
        """

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(query, params)

        results = cur.fetchall()
        cur.close()
        conn.close()

        return results
