from flask import Blueprint, request, jsonify
from db import get_db

reports_bp = Blueprint("reports", __name__)
search_bp = Blueprint("search", __name__)
cve_bp = Blueprint("cve", __name__)

# =========================================================
#   TABLE MAPS
# =========================================================
LOG_TABLES = {
    "hardware": "hardware_logs",
    "security": "security_logs",
    "system": "system_logs",
    "defender": "defender_logs",
    "agent": "agent_logs",
    "commands": "command_results",
}

FTS_TABLES = {
    "security": "security_logs_fts",
    "system": "system_logs_fts",
    "defender": "defender_logs_fts",
    "agent": "agent_logs_fts",
}


# =========================================================
#   GET /api/reports
#   Unified log retrieval for dashboard + detail view
# =========================================================
@reports_bp.get("/api/reports")
def get_reports():
    log_type = request.args.get("type")
    hostname = request.args.get("host")
    record_id = request.args.get("id")  # NEW: fetch a single row
    db = get_db()

    if log_type not in LOG_TABLES:
        return jsonify({"error": "Unknown log type"}), 400

    table = LOG_TABLES[log_type]

    # ---------------------------------------------
    # Fetch a single row by ID (detail view)
    # ---------------------------------------------
    if record_id:
        row = db.execute(
            f"SELECT * FROM {table} WHERE id = ?",
            (record_id,)
        ).fetchone()

        if not row:
            return jsonify({"error": "Record not found"}), 404

        return jsonify(dict(row))

    # ---------------------------------------------
    # Fetch multiple rows (dashboard)
    # ---------------------------------------------
    if hostname:
        rows = db.execute(
            f"SELECT * FROM {table} WHERE hostname = ? ORDER BY timestamp DESC",
            (hostname,)
        ).fetchall()
    else:
        rows = db.execute(
            f"SELECT * FROM {table} ORDER BY timestamp DESC"
        ).fetchall()

    return jsonify([dict(r) for r in rows])


# =========================================================
#   GET /api/search
#   Single-table keyword search (with optional hostname filter)
# =========================================================
@search_bp.get("/api/search")
def search_logs():
    table_key = request.args.get("table")
    keyword = request.args.get("q", "").strip()
    hostname = request.args.get("hostname", "").strip()  # NEW: hostname filter
    limit = int(request.args.get("limit", 200))
    offset = int(request.args.get("offset", 0))

    if table_key not in LOG_TABLES:
        return jsonify({"error": "Invalid table"}), 400

    if not keyword:
        return jsonify({"error": "Missing q"}), 400

    db = get_db()
    table = LOG_TABLES[table_key]

    # ---------------------------------------------------
    # Hardware logs: no FTS
    # ---------------------------------------------------
    if table_key == "hardware":
        where_clause = "WHERE message LIKE ?"
        params = [f"%{keyword}%"]
        
        if hostname:
            where_clause += " AND hostname = ?"
            params.append(hostname)
        
        rows = db.execute(
            f"""
            SELECT *
            FROM {table}
            {where_clause}
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
            """,
            (*params, limit, offset)
        ).fetchall()

        return jsonify({
            "table": table_key,
            "query": keyword,
            "hostname": hostname or None,
            "count": len(rows),
            "results": [dict(r) for r in rows]
        })

    # ---------------------------------------------------
    # FTS path (security, system, defender, agent)
    # ---------------------------------------------------
    fts_table = FTS_TABLES[table_key]
    
    if hostname:
        # First get matching rowids from FTS
        fts_rows = db.execute(
            f"""
            SELECT rowid
            FROM {fts_table}
            WHERE {fts_table} MATCH ?
            LIMIT ? OFFSET ?
            """,
            (keyword, limit, offset)
        ).fetchall()

        rowids = [r["rowid"] for r in fts_rows]

        if not rowids:
            return jsonify({
                "table": table_key,
                "query": keyword,
                "hostname": hostname,
                "count": 0,
                "results": []
            })

        # Then fetch full rows and filter by hostname
        placeholders = ",".join("?" for _ in rowids)
        sql = f"SELECT * FROM {table} WHERE id IN ({placeholders}) AND hostname = ? ORDER BY timestamp DESC"
        full_rows = db.execute(sql, (*rowids, hostname)).fetchall()
    else:
        # No hostname filter
        fts_rows = db.execute(
            f"""
            SELECT rowid
            FROM {fts_table}
            WHERE {fts_table} MATCH ?
            LIMIT ? OFFSET ?
            """,
            (keyword, limit, offset)
        ).fetchall()

        rowids = [r["rowid"] for r in fts_rows]

        if not rowids:
            return jsonify({
                "table": table_key,
                "query": keyword,
                "hostname": None,
                "count": 0,
                "results": []
            })

        placeholders = ",".join("?" for _ in rowids)
        sql = f"SELECT * FROM {table} WHERE id IN ({placeholders}) ORDER BY timestamp DESC"
        full_rows = db.execute(sql, rowids).fetchall()

    return jsonify({
        "table": table_key,
        "query": keyword,
        "hostname": hostname or None,
        "count": len(full_rows),
        "results": [dict(r) for r in full_rows]
    })


# =========================================================
#   POST /api/cve-search
#   Multi-keyword OR search (security logs only)
# =========================================================
# @cve_bp.post("/api/cve-search")
# def cve_search():
#     data = request.get_json(silent=True) or {}
#     keywords = data.get("keywords", [])

#     if not keywords or not isinstance(keywords, list):
#         return jsonify({"error": "Provide 'keywords' as a non-empty list"}), 400

#     cleaned = [k.strip() for k in keywords if k.strip()]
#     if not cleaned:
#         return jsonify({"error": "No valid keywords"}), 400

#     fts_query = " OR ".join(cleaned)
#     db = get_db()

#     rows = db.execute(
#         """
#         SELECT rowid, *
#         FROM security_logs_fts
#         WHERE security_logs_fts MATCH ?
#         LIMIT 200
#         """,
#         (fts_query,)
#     ).fetchall()

#     return jsonify({
#         "query": fts_query,
#         "count": len(rows),
#         "results": [dict(r) for r in rows]
#     })


# =========================================================
#   GET /api/search-multi
#   Multi-table FTS search
# =========================================================
@search_bp.get("/api/search-multi")
def search_multi():
    keyword = request.args.get("q", "").strip()
    hostname = request.args.get("hostname", "").strip()
    limit = int(request.args.get("limit", 200))

    if not keyword:
        return jsonify({"error": "Missing q"}), 400

    db = get_db()
    results = {}

    for key, (table, fts_table) in {
        "system": ("system_logs", "system_logs_fts"),
        "security": ("security_logs", "security_logs_fts"),
        "defender": ("defender_logs", "defender_logs_fts"),
        "agent": ("agent_logs", "agent_logs_fts"),
    }.items():

        fts_rows = db.execute(
            f"""
            SELECT rowid
            FROM {fts_table}
            WHERE {fts_table} MATCH ?
            LIMIT ?
            """,
            (keyword, limit)
        ).fetchall()

        rowids = [r["rowid"] for r in fts_rows]

        if not rowids:
            results[key] = []
            continue

        placeholders = ",".join("?" for _ in rowids)
        
        if hostname:
            sql = f"SELECT * FROM {table} WHERE id IN ({placeholders}) AND hostname = ? ORDER BY timestamp DESC"
            full_rows = db.execute(sql, (*rowids, hostname)).fetchall()
        else:
            sql = f"SELECT * FROM {table} WHERE id IN ({placeholders}) ORDER BY timestamp DESC"
            full_rows = db.execute(sql, rowids).fetchall()

        results[key] = [dict(r) for r in full_rows]

    return jsonify({"query": keyword, "hostname": hostname or None, "results": results})
