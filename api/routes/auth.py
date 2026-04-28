from flask import Blueprint, request, jsonify
from db import get_db
import bcrypt

auth_bp = Blueprint("auth", __name__)

# ---------------------------------------------------------
# Login  (dashboard → API)
# ---------------------------------------------------------
@auth_bp.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"success": False, "error": "Username and password are required."}), 400

    db = get_db()
    row = db.execute(
        "SELECT password, mode FROM users WHERE username = ?", (username,)
    ).fetchone()

    if row is None:
        return jsonify({"success": False, "error": "Invalid username or password."}), 401

    stored_hash = row[0]
    mode = row[1]

    if not bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8")):
        return jsonify({"success": False, "error": "Invalid username or password."}), 401

    return jsonify({"success": True, "mode": mode})
