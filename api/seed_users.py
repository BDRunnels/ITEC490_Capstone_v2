"""
seed_users.py — One-time script to populate the users table with BCrypt-hashed passwords.

Run inside the API container (or locally with access to /data/siem.db):
    python seed_users.py
"""

import bcrypt
import sqlite3

DB_PATH = "/data/siem.db"

USERS = [
    ("bryan",  "admin", "relative"),
    ("john",   "admin", "absolute"),
    ("sheryl", "admin", "absolute"),
    ("eric",   "admin", "absolute"),
]

def seed():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Ensure the users table exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT    UNIQUE NOT NULL,
            password TEXT    NOT NULL,
            mode     TEXT    NOT NULL
        );
    """)

    for username, plaintext, mode in USERS:
        hashed = bcrypt.hashpw(plaintext.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        cur.execute(
            "INSERT OR REPLACE INTO users (username, password, mode) VALUES (?, ?, ?)",
            (username, hashed, mode),
        )

    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed()
