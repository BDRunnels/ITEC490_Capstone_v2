import sqlite3
import os

DB_PATH = "/data/siem.db"

def init_db():
    os.makedirs("/data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # ============================================================
    #                   MAIN LOG TABLES
    # ============================================================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS hardware_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            hostname TEXT,
            os TEXT,
            cpu TEXT,
            ram_gb INTEGER,
            disk_free_gb INTEGER,
            ip TEXT,
            mac TEXT,
            serial TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS security_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            hostname TEXT,
            event_id INTEGER,
            username TEXT,
            logon_type INTEGER,
            source_ip TEXT,
            status TEXT,
            message TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            hostname TEXT,
            event_id INTEGER,
            level TEXT,
            provider TEXT,
            message TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS defender_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            hostname TEXT,
            event_id INTEGER,
            threat_name TEXT,
            message TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS agent_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            hostname TEXT,
            message TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS commands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hostname TEXT NOT NULL,
            command TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            completed_at TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS command_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            command_id INTEGER NOT NULL,
            hostname TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            output TEXT,
            FOREIGN KEY(command_id) REFERENCES commands(id)
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT    UNIQUE NOT NULL,
            password TEXT    NOT NULL,
            mode     TEXT    NOT NULL
        );
    """)

    # ============================================================
    #                   FTS5 SEARCH TABLES
    # ============================================================
    # NOTE: id UNINDEXED must always be last to avoid FTS reordering.
    # NOTE: All numeric fields are stored as TEXT in FTS via CAST().
    cur.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS security_logs_fts USING fts5(
            hostname,
            timestamp,
            event_id,
            username,
            logon_type,
            source_ip,
            status,
            message,
            id UNINDEXED,
            content=''
        );
    """)

    cur.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS system_logs_fts USING fts5(
            hostname,
            timestamp,
            event_id,
            level,
            provider,
            message,
            id UNINDEXED,
            content=''
        );
    """)

    cur.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS defender_logs_fts USING fts5(
            hostname,
            timestamp,
            event_id,
            threat_name,
            message,
            id UNINDEXED,
            content=''
        );
    """)

    cur.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS agent_logs_fts USING fts5(
            hostname,
            timestamp,
            message,
            id UNINDEXED,
            content=''
        );
    """)

    # ============================================================
    #                   TRIGGERS (INSERT/UPDATE/DELETE)
    # ============================================================

    # ---------------- SECURITY LOGS ----------------
    cur.executescript("""
        DROP TRIGGER IF EXISTS trg_security_logs_ai;
        DROP TRIGGER IF EXISTS trg_security_logs_au;
        DROP TRIGGER IF EXISTS trg_security_logs_ad;

        CREATE TRIGGER trg_security_logs_ai
        AFTER INSERT ON security_logs
        BEGIN
            INSERT INTO security_logs_fts (
                hostname, timestamp, event_id, username,
                logon_type, source_ip, status, message, id
            )
            VALUES (
                NEW.hostname,
                NEW.timestamp,
                CAST(NEW.event_id AS TEXT),
                NEW.username,
                CAST(NEW.logon_type AS TEXT),
                NEW.source_ip,
                NEW.status,
                NEW.message,
                CAST(NEW.id AS TEXT)
            );
        END;

        CREATE TRIGGER trg_security_logs_au
        AFTER UPDATE ON security_logs
        BEGIN
            UPDATE security_logs_fts
            SET
                hostname = NEW.hostname,
                timestamp = NEW.timestamp,
                event_id = CAST(NEW.event_id AS TEXT),
                username = NEW.username,
                logon_type = CAST(NEW.logon_type AS TEXT),
                source_ip = NEW.source_ip,
                status = NEW.status,
                message = NEW.message
            WHERE id = CAST(OLD.id AS TEXT);
        END;

        CREATE TRIGGER trg_security_logs_ad
        AFTER DELETE ON security_logs
        BEGIN
            DELETE FROM security_logs_fts WHERE id = CAST(OLD.id AS TEXT);
        END;
    """)

    # ---------------- SYSTEM LOGS ----------------
    cur.executescript("""
        DROP TRIGGER IF EXISTS trg_system_logs_ai;
        DROP TRIGGER IF EXISTS trg_system_logs_au;
        DROP TRIGGER IF EXISTS trg_system_logs_ad;

        CREATE TRIGGER trg_system_logs_ai
        AFTER INSERT ON system_logs
        BEGIN
            INSERT INTO system_logs_fts (
                hostname, timestamp, event_id, level, provider, message, id
            )
            VALUES (
                NEW.hostname,
                NEW.timestamp,
                CAST(NEW.event_id AS TEXT),
                NEW.level,
                NEW.provider,
                NEW.message,
                CAST(NEW.id AS TEXT)
            );
        END;

        CREATE TRIGGER trg_system_logs_au
        AFTER UPDATE ON system_logs
        BEGIN
            UPDATE system_logs_fts
            SET
                hostname = NEW.hostname,
                timestamp = NEW.timestamp,
                event_id = CAST(NEW.event_id AS TEXT),
                level = NEW.level,
                provider = NEW.provider,
                message = NEW.message
            WHERE id = CAST(OLD.id AS TEXT);
        END;

        CREATE TRIGGER trg_system_logs_ad
        AFTER DELETE ON system_logs
        BEGIN
            DELETE FROM system_logs_fts WHERE id = CAST(OLD.id AS TEXT);
        END;
    """)

    # ---------------- DEFENDER LOGS ----------------
    cur.executescript("""
        DROP TRIGGER IF EXISTS trg_defender_logs_ai;
        DROP TRIGGER IF EXISTS trg_defender_logs_au;
        DROP TRIGGER IF EXISTS trg_defender_logs_ad;

        CREATE TRIGGER trg_defender_logs_ai
        AFTER INSERT ON defender_logs
        BEGIN
            INSERT INTO defender_logs_fts (
                hostname, timestamp, event_id, threat_name, message, id
            )
            VALUES (
                NEW.hostname,
                NEW.timestamp,
                CAST(NEW.event_id AS TEXT),
                NEW.threat_name,
                NEW.message,
                CAST(NEW.id AS TEXT)
            );
        END;

        CREATE TRIGGER trg_defender_logs_au
        AFTER UPDATE ON defender_logs
        BEGIN
            UPDATE defender_logs_fts
            SET
                hostname = NEW.hostname,
                timestamp = NEW.timestamp,
                event_id = CAST(NEW.event_id AS TEXT),
                threat_name = NEW.threat_name,
                message = NEW.message
            WHERE id = CAST(OLD.id AS TEXT);
        END;

        CREATE TRIGGER trg_defender_logs_ad
        AFTER DELETE ON defender_logs
        BEGIN
            DELETE FROM defender_logs_fts WHERE id = CAST(OLD.id AS TEXT);
        END;
    """)

    # ---------------- AGENT LOGS ----------------
    cur.executescript("""
        DROP TRIGGER IF EXISTS trg_agent_logs_ai;
        DROP TRIGGER IF EXISTS trg_agent_logs_au;
        DROP TRIGGER IF EXISTS trg_agent_logs_ad;

        CREATE TRIGGER trg_agent_logs_ai
        AFTER INSERT ON agent_logs
        BEGIN
            INSERT INTO agent_logs_fts (
                hostname, timestamp, message, id
            )
            VALUES (
                NEW.hostname,
                NEW.timestamp,
                NEW.message,
                CAST(NEW.id AS TEXT)
            );
        END;

        CREATE TRIGGER trg_agent_logs_au
        AFTER UPDATE ON agent_logs
        BEGIN
            UPDATE agent_logs_fts
            SET
                hostname = NEW.hostname,
                timestamp = NEW.timestamp,
                message = NEW.message
            WHERE id = CAST(OLD.id AS TEXT);
        END;

        CREATE TRIGGER trg_agent_logs_ad
        AFTER DELETE ON agent_logs
        BEGIN
            DELETE FROM agent_logs_fts WHERE id = CAST(OLD.id AS TEXT);
        END;
    """)

    conn.commit()
    conn.close()
