// search.js — frontend helper module

const API = "/api";

// Single-table search (with optional hostname filter)
export async function searchTable(table, query, hostname = null, limit = 200, offset = 0) {
    let url = `${API}/search?table=${table}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
    if (hostname) {
        url += `&hostname=${encodeURIComponent(hostname)}`;
    }
    const res = await fetch(url);
    return res.json();
}

// -----------------------------
// Multi-table search
// -----------------------------
export async function searchAll(query, hostname = null, limit = 200) {
    let url = `${API}/search-multi?q=${encodeURIComponent(query)}&limit=${limit}`;
    if (hostname) {
        url += `&hostname=${encodeURIComponent(hostname)}`;
    }
    const res = await fetch(url);
    return res.json();
}

// -----------------------------
// List logs for dashboard
// -----------------------------
export async function listLogs(type, host = null) {
    const url = host
        ? `${API}/reports?type=${type}&host=${host}`
        : `${API}/reports?type=${type}`;
    const res = await fetch(url);
    return res.json();
}

// -----------------------------
// Fetch a single log entry
// -----------------------------
export async function getLog(type, id) {
    const url = `${API}/reports?type=${type}&id=${id}`;
    const res = await fetch(url);
    return res.json();
}

// -----------------------------
// CVE multi-keyword search
// -----------------------------
export async function searchCVE(keywords) {
    const res = await fetch(`${API}/cve-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords })
    });
    return res.json();
}