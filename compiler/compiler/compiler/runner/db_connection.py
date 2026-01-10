import psycopg2

def get_connection():
    return psycopg2.connect(
        dbname="stocks",
        user="user",
        password="password",
        host="localhost",
        port=5432
    )
