from flask import jsonify
from pydantic import ValidationError


def validation_error_response(e: ValidationError):
    return jsonify({
        "error": "validation_error",
        "message": "Request body failed validation.",
        "details": [
            {"field": ".".join(str(p) for p in err["loc"]), "issue": err["msg"]}
            for err in e.errors()
        ],
    }), 400


def conflict(message: str):
    return jsonify({"error": "conflict", "message": message}), 409


def bad_request(message: str):
    return jsonify({"error": "bad_request", "message": message}), 400
