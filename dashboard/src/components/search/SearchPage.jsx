import React, { useState, useEffect, useContext } from "react";
import { HostContext } from "../../context/HostContext";
import {
    searchTable,
    searchAll,
    getLog
} from "./search";

export default function SearchPage() {
    const { currentHost } = useContext(HostContext);  // Get selected computer
    
    const [query, setQuery] = useState("");
    const [table, setTable] = useState("security");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState("");

    // Run search whenever query, table, or currentHost changes
    useEffect(() => {
        if (!query || !currentHost) {  // Require both query AND selected host
            setResults([]);
            return;
        }

        setError("");
        setLoading(true);

        // Single-table search with hostname filter
        searchTable(table, query, currentHost)
            .then(data => {
                if (data.results) {
                    setResults(data.results);
                } else {
                    setError(data.error || "Search failed");
                    setResults([]);
                }
            })
            .catch(err => {
                setError(`Error: ${err.message}`);
                setResults([]);
            })
            .finally(() => setLoading(false));

    }, [query, table, currentHost]);

    async function openDetail(row) {
        try {
            const full = await getLog(table, row.id);
            setSelected(full);
        } catch (err) {
            setError(`Failed to load details: ${err.message}`);
        }
    }

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h2>SIEM Search</h2>

            {/* Selected Computer Display */}
            <div style={{
                marginBottom: "20px",
                padding: "10px",
                backgroundColor: currentHost ? "#e8f5e9" : "#ffebee",
                border: `2px solid ${currentHost ? "#4caf50" : "#f44336"}`,
                borderRadius: "6px"
            }}>
                {currentHost ? (
                    <p style={{ margin: 0, color: "#2e7d32", fontWeight: "bold" }}>
                        ✓ Searching on: <strong>{currentHost}</strong>
                    </p>
                ) : (
                    <p style={{ margin: 0, color: "#c62828", fontWeight: "bold" }}>
                        ⚠ Please select a computer first (go to Computers page)
                    </p>
                )}
            </div>

            {/* Search Controls */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <input
                    style={{
                        flex: 1,
                        padding: "8px",
                        opacity: currentHost ? 1 : 0.5,
                        cursor: currentHost ? "text" : "not-allowed"
                    }}
                    placeholder="Search logs…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    disabled={!currentHost}  // Disable if no host selected
                />

                <select
                    value={table}
                    onChange={e => setTable(e.target.value)}
                    style={{
                        padding: "8px",
                        opacity: currentHost ? 1 : 0.5,
                        cursor: currentHost ? "pointer" : "not-allowed"
                    }}
                    disabled={!currentHost}  // Disable if no host selected
                >
                    <option value="security">Security</option>
                    <option value="system">System</option>
                    <option value="defender">Defender</option>
                    <option value="agent">Agent</option>
                </select>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: "12px",
                    marginBottom: "20px",
                    backgroundColor: "#ffcdd2",
                    color: "#b71c1c",
                    borderRadius: "4px"
                }}>
                    {error}
                </div>
            )}

            {/* Loading Indicator */}
            {loading && <p style={{ fontStyle: "italic", color: "#666" }}>Searching…</p>}

            {/* Results List */}
            {!loading && results.length > 0 && currentHost && (
                <div style={{
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    overflow: "hidden"
                }}>
                    <p style={{ padding: "10px", background: "#f5f5f5", margin: 0 }}>
                        Found <strong>{results.length}</strong> result(s)
                    </p>
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
            {!loading && query && currentHost && results.length === 0 && (
                <p style={{ color: "#999" }}>No results found for "{query}" on {currentHost}.</p>
            )}

            {/* Detail Modal */}
            {selected && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
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
                            whiteSpace: "pre-wrap",
                            fontSize: "12px",
                            maxHeight: "50vh",
                            overflowY: "auto"
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