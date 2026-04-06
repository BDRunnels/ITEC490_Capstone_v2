import React, { useState, useEffect, useContext, useMemo } from "react";
import { HostContext } from "../../context/HostContext";
import { MDBAccordion, MDBAccordionItem } from 'mdb-react-ui-kit';
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

    // Group results by hostname
    const groupedResults = useMemo(() => {
        const groups = {};
        results.forEach(row => {
            if (!groups[row.hostname]) {
                groups[row.hostname] = [];
            }
            groups[row.hostname].push(row);
        });
        return groups;
    }, [results]);

    // Run search whenever query or table changes (hostname is optional)
    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        setError("");
        setLoading(true);

        // Search across all hosts if no currentHost, or filter by host if selected
        searchTable(table, query, currentHost || null)
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

    // Prefetch search functions for common admin queries
    const runPrefetchSearch = (searchQuery, searchTable) => {
        setQuery(searchQuery);
        setTable(searchTable);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h2>SIEM Search</h2>

            {/* Selected Computer Display */}
            <div style={{
                marginBottom: "20px",
                padding: "10px",
                backgroundColor: currentHost ? "#e8f5e9" : "#e3f2fd",
                border: `2px solid ${currentHost ? "#4caf50" : "#2196F3"}`,
                borderRadius: "6px"
            }}>
                {currentHost ? (
                    <p style={{ margin: 0, color: "#2e7d32", fontWeight: "bold" }}>
                        ✓ Filtering by: <strong>{currentHost}</strong> (Click "Computers" to change)
                    </p>
                ) : (
                    <p style={{ margin: 0, color: "#1565c0", fontWeight: "bold" }}>
                        🔍 Searching across ALL hosts (Select a computer to filter by host)
                    </p>
                )}
            </div>

            {/* Quick Search Buttons */}
            <div style={{ marginBottom: "20px" }}>
                <h4 style={{ marginBottom: "10px", color: "#333" }}>Quick Searches</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {/* Security Events */}
                        <button
                            onClick={() => runPrefetchSearch("4625", "security")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                            title="Failed login attempts"
                        >
                            🔐 Failed Logins
                        </button>
                        <button
                            onClick={() => runPrefetchSearch("4624", "security")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                            title="Successful login events"
                        >
                            ✅ Successful Logins
                        </button>
                        <button
                            onClick={() => runPrefetchSearch("4740", "security")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#ffc107",
                                color: "black",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                            title="Account lockout events"
                        >
                            🔒 Account Lockouts
                        </button>
                        <button
                            onClick={() => runPrefetchSearch("4720 OR 4722 OR 4724 OR 4738", "security")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#6f42c1",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                            title="User account management events"
                        >
                            👤 Account Changes
                        </button>

                        {/* System Events */}
                        <button
                            onClick={() => runPrefetchSearch("7031 OR 7034", "system")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#fd7e14",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                            title="Service start/stop failures"
                        >
                            ⚙️ Service Failures
                        </button>
                        <button
                            onClick={() => runPrefetchSearch("error", "system")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                            title="System error events"
                        >
                            ❌ System Errors
                        </button>
                        <button
                            onClick={() => runPrefetchSearch("12 OR 13", "system")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#20c997",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                            title="System startup and shutdown events"
                        >
                            🔄 System Start/Stop
                        </button>

                        {/* Defender Events */}
                        <button
                            onClick={() => runPrefetchSearch("threat", "defender")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#e83e8c",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                            title="Windows Defender threat detections"
                        >
                            🛡️ Defender Threats
                        </button>
                        <button
                            onClick={() => runPrefetchSearch("scan", "defender")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#17a2b8",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                            title="Defender scan results"
                        >
                            🔍 Scan Results
                        </button>

                        {/* General Searches */}
                        <button
                            onClick={() => runPrefetchSearch("warning", "system")}
                            style={{
                                padding: "8px 12px",
                                backgroundColor: "#ffc107",
                                color: "black",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                            title="System warning events"
                        >
                            ⚠️ Warnings
                        </button>
                    </div>
                </div>

            {/* Search Controls */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <input
                    style={{
                        flex: 1,
                        padding: "8px"
                    }}
                    placeholder="Search logs…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />

                <select
                    value={table}
                    onChange={e => setTable(e.target.value)}
                    style={{
                        padding: "8px"
                    }}
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
            {!loading && results.length > 0 && (
                <div style={{
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    overflow: "hidden"
                }}>
                    <p style={{ padding: "10px", background: "#f5f5f5", margin: 0 }}>
                        Found <strong>{results.length}</strong> result(s) across <strong>{Object.keys(groupedResults).length}</strong> host(s)
                    </p>

                    <MDBAccordion initialActive={1}>
                        {Object.entries(groupedResults).map(([hostname, hostResults], index) => (
                            <MDBAccordionItem
                                collapseId={index + 1}
                                headerTitle={`${hostname} (${hostResults.length} result${hostResults.length !== 1 ? 's' : ''})`}
                                key={hostname}
                                className="mb-0"
                            >
                                <div style={{ padding: "10px" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead style={{ background: "#f9f9f9" }}>
                                            <tr>
                                                <th style={{ padding: "8px", textAlign: "left" }}>Timestamp</th>
                                                <th style={{ padding: "8px", textAlign: "left" }}>Message</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hostResults.map(row => (
                                                <tr
                                                    key={row.id}
                                                    onClick={() => openDetail(row)}
                                                    style={{
                                                        cursor: "pointer",
                                                        borderBottom: "1px solid #eee"
                                                    }}
                                                >
                                                    <td style={{ padding: "8px" }}>{row.timestamp}</td>
                                                    <td style={{ padding: "8px" }}>
                                                        {row.message?.slice(0, 120)}…
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </MDBAccordionItem>
                        ))}
                    </MDBAccordion>
                </div>
            )}

            {/* No results */}
            {!loading && query && results.length === 0 && (
                <p style={{ color: "#999" }}>
                    No results found for "{query}" {currentHost ? `on ${currentHost}` : "across all hosts"}.
                </p>
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