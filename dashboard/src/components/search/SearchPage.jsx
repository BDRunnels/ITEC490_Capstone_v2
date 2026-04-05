import React, { useState, useEffect } from "react";
import {
    searchTable,
    searchAll,
    getLog
} from "./search"; // your frontend helper module

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [table, setTable] = useState("security");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null); // detail view

    // Run search whenever query or table changes
    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        setLoading(true);

        // Single-table search
        searchTable(table, query)
            .then(data => setResults(data.results || []))
            .finally(() => setLoading(false));

    }, [query, table]);

    // Load detail view
    async function openDetail(row) {
        const full = await getLog(table, row.id);
        setSelected(full);
    }

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h2>SIEM Search</h2>

            {/* Search Controls */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <input
                    style={{ flex: 1, padding: "8px" }}
                    placeholder="Search logs…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />

                <select
                    value={table}
                    onChange={e => setTable(e.target.value)}
                    style={{ padding: "8px" }}
                >
                    <option value="security">Security</option>
                    <option value="system">System</option>
                    <option value="defender">Defender</option>
                    <option value="agent">Agent</option>
                </select>
            </div>

            {/* Loading Indicator */}
            {loading && <p>Searching…</p>}

            {/* Results List */}
            {!loading && results.length > 0 && (
                <div style={{
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    overflow: "hidden"
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ background: "#f0f0f0" }}>
                            <tr>
                                <th style={{ padding: "8px", textAlign: "left" }}>Timestamp</th>
                                <th style={{ padding: "8px", textAlign: "left" }}>Hostname</th>
                                <th style={{ padding: "8px", textAlign: "left" }}>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(row => (
                                <tr
                                    key={row.id}
                                    onClick={() => openDetail(row)}
                                    style={{
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee"
                                    }}
                                >
                                    <td style={{ padding: "8px" }}>{row.timestamp}</td>
                                    <td style={{ padding: "8px" }}>{row.hostname}</td>
                                    <td style={{ padding: "8px" }}>
                                        {row.message?.slice(0, 120)}…
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* No results */}
            {!loading && query && results.length === 0 && (
                <p>No results found.</p>
            )}

            {/* Detail Modal */}
            {selected && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <div style={{
                        background: "white",
                        padding: "20px",
                        width: "600px",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        borderRadius: "8px"
                    }}>
                        <h3>Log Details</h3>

                        <pre style={{
                            background: "#f7f7f7",
                            padding: "10px",
                            borderRadius: "6px",
                            whiteSpace: "pre-wrap"
                        }}>
{JSON.stringify(selected, null, 2)}
                        </pre>

                        <button
                            onClick={() => setSelected(null)}
                            style={{
                                marginTop: "10px",
                                padding: "8px 12px",
                                background: "#333",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}