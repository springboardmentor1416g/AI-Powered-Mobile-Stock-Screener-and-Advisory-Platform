from flask import Blueprint, request, jsonify
from services.llm_parser import parse_query
from services.dsl_validator import validate_dsl
from services.screener_engine import run_screener

screener_bp = Blueprint("screener", __name__)

@screener_bp.route("/screener", methods=["POST"])
def screener():
    nl_query = request.json.get("query")

    dsl = parse_query(nl_query)
    if not validate_dsl(dsl):
        return jsonify({"error": "Invalid query"}), 400

    results = run_screener(dsl)
    return jsonify(results)
