from flask import Flask
from routes.screener import screener_bp

app = Flask(__name__)
app.register_blueprint(screener_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
