def normalize_hardware(data: dict) -> dict:
    return {
        "timestamp": data["timestamp"],
        "hostname": data["hostname"],
        "os": data.get("os"),
        "cpu": data.get("cpu"),
        "ram_gb": data.get("ram_gb"),
        "disk_free_gb": data.get("disk_free_gb"),
        "ip": data.get("ip"),
        "mac": data.get("mac"),
        "serial": data.get("serial"),
    }