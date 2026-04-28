import sqlite3
import random
from datetime import datetime, timedelta

DB_PATH = "./data/siem.db"

hosts = [
    {"hostname": "DESKTOP-ALPHA", "os": "Windows 10 Pro", "ip": "192.168.1.10"},
    {"hostname": "SRV-BETA", "os": "Windows Server 2022", "ip": "10.0.0.50"},
    {"hostname": "LAPTOP-GAMMA", "os": "Windows 11 Enterprise", "ip": "192.168.1.15"},
    {"hostname": "DC-DELTA", "os": "Windows Server 2019", "ip": "10.0.0.10"}
]

def generate_timestamp(days_ago=0):
    return (datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0,23), minutes=random.randint(0,59))).strftime("%Y-%m-%d %H:%M:%S")

def seed():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    for host in hosts:
        # Hardware Logs
        cur.execute("""
            INSERT INTO hardware_logs (timestamp, hostname, os, cpu, ram_gb, disk_free_gb, ip, mac, serial)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            generate_timestamp(),
            host["hostname"],
            host["os"],
            "Intel Core i7" if "DESKTOP" in host["hostname"] else "AMD EPYC",
            random.choice([16, 32, 64]),
            random.randint(50, 500),
            host["ip"],
            f"00:1A:2B:3C:4D:{random.randint(10,99)}",
            f"SN-{random.randint(10000,99999)}"
        ))
        
        # Security Logs
        for _ in range(3):
            cur.execute("""
                INSERT INTO security_logs (timestamp, hostname, event_id, username, logon_type, source_ip, status, message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                generate_timestamp(random.randint(0,3)),
                host["hostname"],
                random.choice([4624, 4625, 4634]),
                "Administrator" if random.random() > 0.5 else "Guest",
                random.choice([2, 3, 10]),
                f"192.168.1.{random.randint(100,200)}",
                "Success" if random.random() > 0.3 else "Failed",
                "Logon attempt recorded"
            ))
            
        # System Logs
        cur.execute("""
            INSERT INTO system_logs (timestamp, hostname, event_id, level, provider, message)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            generate_timestamp(1),
            host["hostname"],
            10016,
            "Warning",
            "Microsoft-Windows-DistributedCOM",
            "The machine-default permission settings do not grant Local Activation permission for the COM Server application."
        ))

        # Defender Logs
        if random.random() > 0.5:
            cur.execute("""
                INSERT INTO defender_logs (timestamp, hostname, event_id, threat_name, message)
                VALUES (?, ?, ?, ?, ?)
            """, (
                generate_timestamp(2),
                host["hostname"],
                1116,
                "Trojan:Win32/Wacatac.B!ml" if random.random() > 0.5 else "Eicar-Test-Signature",
                "Malware detected and quarantined successfully."
            ))
            
        # Agent Logs
        cur.execute("""
            INSERT INTO agent_logs (timestamp, hostname, message)
            VALUES (?, ?, ?)
        """, (
            generate_timestamp(),
            host["hostname"],
            "Agent heartbeat successful. Connected to SIEM backend."
        ))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed()
