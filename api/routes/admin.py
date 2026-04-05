from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime, timedelta
import random

admin_bp = Blueprint("admin", __name__)

# ---------------------------------------------------------
# Wipe logs (dashboard-only)
# ---------------------------------------------------------
@admin_bp.post("/api/wipe")
def wipe():
    data = request.get_json(silent=True) or {}
    if data.get("password") != "admin":
        return jsonify({"status": "error", "message": "Unauthorized"}), 401

    db = get_db()
    for table in ["hardware_logs", "security_logs", "system_logs", "defender_logs", "agent_logs"]:
        try:
            db.execute(f"DELETE FROM {table}")
        except Exception:
            pass

    db.commit()
    return jsonify({"status": "ok"})

# ---------------------------------------------------------
# Create command (dashboard-only)
# ---------------------------------------------------------
@admin_bp.post("/api/commands")
def create_command():
    data = request.get_json()
    hostname = data.get("hostname")
    command = data.get("command")

    if not hostname or not command:
        return jsonify({"error": "hostname and command required"}), 400

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    db = get_db()
    db.execute("""
        INSERT INTO commands (hostname, command, status, created_at)
        VALUES (?, ?, 'pending', ?)
    """, (hostname, command, ts))
    db.commit()

    return jsonify({"status": "queued"})

# ---------------------------------------------------------
# Seed and Unseed Dummy Data (dashboard-only)
# ---------------------------------------------------------
DUMMY_HOSTS = ["DESKTOP-ALPHA", "SRV-BETA", "LAPTOP-GAMMA", "DC-DELTA"]

@admin_bp.post("/api/seed")
def seed_dummy_data():
    data = request.get_json(silent=True) or {}
    if data.get("password") != "admin":
        return jsonify({"status": "error", "message": "Unauthorized"}), 401

    db = get_db()
    
    hosts = [
        {"hostname": "DESKTOP-ALPHA", "os": "Windows 10 Pro", "ip": "192.168.1.10"},
        {"hostname": "SRV-BETA", "os": "Windows Server 2022", "ip": "10.0.0.50"},
        {"hostname": "LAPTOP-GAMMA", "os": "Windows 11 Enterprise", "ip": "192.168.1.15"},
        {"hostname": "DC-DELTA", "os": "Windows Server 2019", "ip": "10.0.0.10"}
    ]

    def _ts(days_ago=0):
        return (datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0,23), minutes=random.randint(0,59))).strftime("%Y-%m-%d %H:%M:%S")

    for host in hosts:
        db.execute("""
            INSERT INTO hardware_logs (timestamp, hostname, os, cpu, ram_gb, disk_free_gb, ip, mac, serial)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (_ts(), host["hostname"], host["os"], "Intel Core i7" if "DESKTOP" in host["hostname"] else "AMD EPYC",
              random.choice([16, 32, 64]), random.randint(50, 500), host["ip"],
              f"00:1A:2B:3C:4D:{random.randint(10,99)}", f"SN-{random.randint(10000,99999)}"))
        
        for _ in range(3):
            db.execute("""
                INSERT INTO security_logs (timestamp, hostname, event_id, username, logon_type, source_ip, status, message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (_ts(random.randint(0,3)), host["hostname"], random.choice([4624, 4625, 4634]),
                  "Administrator" if random.random() > 0.5 else "Guest", random.choice([2, 3, 10]),
                  f"192.168.1.{random.randint(100,200)}", "Success" if random.random() > 0.3 else "Failed", "Logon attempt recorded"))
            
        db.execute("""
            INSERT INTO system_logs (timestamp, hostname, event_id, level, provider, message)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (_ts(1), host["hostname"], 10016, "Warning", "Microsoft-Windows-DistributedCOM",
              "The machine-default permission settings do not grant Local Activation permission for the COM Server application."))

        if random.random() > 0.5:
            db.execute("""
                INSERT INTO defender_logs (timestamp, hostname, event_id, threat_name, message)
                VALUES (?, ?, ?, ?, ?)
            """, (_ts(2), host["hostname"], 1116, "Trojan:Win32/Wacatac.B!ml" if random.random() > 0.5 else "Eicar-Test-Signature", "Malware detected and quarantined successfully."))
            
        db.execute("""
            INSERT INTO agent_logs (timestamp, hostname, message)
            VALUES (?, ?, ?)
        """, (_ts(), host["hostname"], "Agent heartbeat successful. Connected to SIEM backend."))

    db.commit()
    return jsonify({"status": "ok", "message": "Dummy data seeded successfully."})

@admin_bp.post("/api/unseed")
def unseed_dummy_data():
    data = request.get_json(silent=True) or {}
    if data.get("password") != "admin":
        return jsonify({"status": "error", "message": "Unauthorized"}), 401

    db = get_db()
    for table in ["hardware_logs", "security_logs", "system_logs", "defender_logs", "agent_logs"]:
        for d_host in DUMMY_HOSTS:
            try:
                db.execute(f"DELETE FROM {table} WHERE hostname = ?", (d_host,))
            except Exception:
                pass

    db.commit()
    return jsonify({"status": "ok", "message": "Dummy data removed successfully."})