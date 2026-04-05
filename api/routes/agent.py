# from flask import Blueprint, request, make_response, jsonify, Response
# from db import get_db
# import os

# agent_bp = Blueprint("agent", __name__)

# # ---------------------------------------------------------
# # Generate agent script (downloaded by custodians)
# # ---------------------------------------------------------
# @agent_bp.get("/api/generate-agent.ps1")
# def generate_agent_bundle():
#     import io
#     import zipfile

#     host = request.args.get("host")
#     if host:
#         api_url = f"http://{host}:5000/api"
#     else:
#         api_url = os.getenv("API_URL", "http://localhost:5000/api")

#     # Correct paths (same as your working route)
#     agent_template_path = os.path.join("/app/templates", "siem-agent-template.ps1")
#     start_template_path = os.path.join("/app/templates", "dashboard-report-start-template.cmd")

#     with open(agent_template_path, "r", encoding="utf8") as f:
#         agent_template = f.read()

#     with open(start_template_path, "r", encoding="utf8") as f:
#         start_template = f.read()

#     agent_final = agent_template.replace("__API_URL__", api_url)
#     start_final = start_template.replace("__API_URL__", api_url)

#     mem_zip = io.BytesIO()
#     with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as z:
#         z.writestr("siem-agent.ps1", agent_final)
#         z.writestr("dashboard-report-start.cmd", start_final)

#     mem_zip.seek(0)

#     resp = make_response(mem_zip.read())
#     resp.headers["Content-Disposition"] = "attachment; filename=siem-agent-bundle.zip"
#     resp.headers["Content-Type"] = "application/zip"
#     return resp


# # ---------------------------------------------------------
# # Generate kill script (downloaded by custodians)
# # ---------------------------------------------------------
# @agent_bp.get("/api/generate-kill-script")
# def generate_kill_script():
#     template_path = "/app/templates/kill-script.ps1"

#     try:
#         with open(template_path, "r", encoding="utf-8") as f:
#             content = f.read()
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     return Response(
#         content,
#         mimetype="text/plain",
#         headers={"Content-Disposition": "attachment; filename=kill-script.ps1"}
#     )


# # ---------------------------------------------------------
# # Agent polls for next pending command
# # ---------------------------------------------------------
# @agent_bp.get("/api/next-command")
# def next_command():
#     hostname = request.args.get("host")
#     if not hostname:
#         return jsonify({})

#     db = get_db()
#     row = db.execute("""
#         SELECT id, command FROM commands
#         WHERE hostname = ? AND status = 'pending'
#         ORDER BY id ASC
#         LIMIT 1
#     """, (hostname,)).fetchone()

#     if not row:
#         return jsonify({})

#     return jsonify({
#         "id": row["id"],
#         "command": row["command"]
#     })

from flask import Blueprint, request, make_response, jsonify, Response
from db import get_db
import os

agent_bp = Blueprint("agent", __name__)

# ---------------------------------------------------------
# Generate agent script (downloaded by custodians)
# ---------------------------------------------------------
@agent_bp.get("/api/generate-agent.ps1")
def generate_agent_bundle():
    import io
    import zipfile

    host = request.args.get("host")
    if host:
        api_url = f"http://{host}:5000/api"
    else:
        api_url = os.getenv("API_URL", "http://localhost:5000/api")

    # Correct paths (same as your working route)
    agent_template_path = os.path.join("/app/templates", "siem-agent-template.ps1")
    start_template_path = os.path.join("/app/templates", "dashboard-report-start-template.cmd")

    with open(agent_template_path, "r", encoding="utf8") as f:
        agent_template = f.read()

    with open(start_template_path, "r", encoding="utf8") as f:
        start_template = f.read()

    agent_final = agent_template.replace("__API_URL__", api_url)
    start_final = start_template.replace("__API_URL__", api_url)

    mem_zip = io.BytesIO()
    with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("siem-agent.ps1", agent_final)
        z.writestr("dashboard-report-start.cmd", start_final)

    mem_zip.seek(0)

    resp = make_response(mem_zip.read())
    resp.headers["Content-Disposition"] = "attachment; filename=siem-agent-bundle.zip"
    resp.headers["Content-Type"] = "application/zip"
    return resp


# ---------------------------------------------------------
# Generate kill script (downloaded by custodians)
# ---------------------------------------------------------
@agent_bp.get("/api/generate-kill-script")
def generate_kill_script():
    host = request.args.get("host")
    if host:
        api_url = f"http://{host}:5000/api"
    else:
        api_url = os.getenv("API_URL", "http://localhost:5000/api")

    template_path = "/app/templates/kill-script-template.ps1"

    try:
        with open(template_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Inject API URL
        final_script = content.replace("__API_URL__", api_url)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return Response(
        final_script,
        mimetype="text/plain",
        headers={"Content-Disposition": "attachment; filename=kill-script.ps1"}
    )


# ---------------------------------------------------------
# Agent polls for next pending command
# ---------------------------------------------------------
@agent_bp.get("/api/next-command")
def next_command():
    hostname = request.args.get("host")
    if not hostname:
        return jsonify({})

    db = get_db()
    row = db.execute("""
        SELECT id, command FROM commands
        WHERE hostname = ? AND status = 'pending'
        ORDER BY id ASC
        LIMIT 1
    """, (hostname,)).fetchone()

    if not row:
        return jsonify({})

    return jsonify({
        "id": row["id"],
        "command": row["command"]
    })