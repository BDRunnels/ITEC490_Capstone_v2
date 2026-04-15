import React, { useState, useEffect, useContext, useMemo } from "react";
import { HostContext } from "../../context/HostContext";
import { MDBAccordion, MDBAccordionItem, MDBBtn } from 'mdb-react-ui-kit';
import {
    searchTable,
    searchAll,
    getLog
} from "./search";

export default function SearchPage() {
    const { currentHost, theme } = useContext(HostContext);
    
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

    const runPrefetchSearch = (searchQuery, searchTable) => {
        setQuery(searchQuery);
        setTable(searchTable);
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h1 className="text-center mb-4">SIEM Search</h1>

            <div className="container" style={{ maxWidth: '1000px' }}>
                <div
                    className={`p-4 rounded ${theme === 'light-mode' ? 'bg-light text-dark border border-dark' : ''}`}
                    style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.85)', ...(theme === 'dark-mode' ? { backgroundColor: "#1e1e2f" } : {}) }}
                >

                    {/* Selected Computer Display */}
                    <div className={`alert ${currentHost ? 'alert-success' : 'alert-info'} d-flex align-items-center mb-4`}>
                        {currentHost ? (
                            <span className="fw-bold">
                                <i className="fas fa-check-circle me-2"></i>
                                Filtering by: <strong>{currentHost}</strong> (Click "Computers" to change)
                            </span>
                        ) : (
                            <span className="fw-bold">
                                <i className="fas fa-search me-2"></i>
                                Searching across ALL hosts (Select a computer to filter by host)
                            </span>
                        )}
                    </div>

                    {/* Quick Search Buttons */}
                    <div className="mb-4">
                        <h5 className={`mb-3 ${theme === 'light-mode' ? 'text-light' : 'text-white'}`}>
                            <i className="fas fa-bolt me-2 text-warning"></i>Quick Searches
                        </h5>
                        <div className="d-flex flex-wrap gap-2">
                            {/* Security Events */}
                            <button
                                className="btn btn-danger btn-sm rounded-pill px-3 shadow-sm"
                                onClick={() => runPrefetchSearch("4625", "security")}
                                title="Failed login attempts"
                            >
                                <i className="fas fa-lock me-1"></i> Failed Logins
                            </button>
                            <button
                                className="btn btn-success btn-sm rounded-pill px-3 shadow-sm"
                                onClick={() => runPrefetchSearch("4624", "security")}
                                title="Successful login events"
                            >
                                <i className="fas fa-check me-1"></i> Successful Logins
                            </button>
                            <button
                                className="btn btn-warning btn-sm rounded-pill px-3 shadow-sm"
                                onClick={() => runPrefetchSearch("4740", "security")}
                                title="Account lockout events"
                            >
                                <i className="fas fa-user-lock me-1"></i> Account Lockouts
                            </button>
                            <button
                                className="btn btn-sm rounded-pill px-3 shadow-sm text-white"
                                style={{ backgroundColor: "#6f42c1" }}
                                onClick={() => runPrefetchSearch("4720 OR 4722 OR 4724 OR 4738", "security")}
                                title="User account management events"
                            >
                                <i className="fas fa-user-edit me-1"></i> Account Changes
                            </button>

                            {/* System Events */}
                            <button
                                className="btn btn-sm rounded-pill px-3 shadow-sm text-white"
                                style={{ backgroundColor: "#fd7e14" }}
                                onClick={() => runPrefetchSearch("7031 OR 7034", "system")}
                                title="Service start/stop failures"
                            >
                                <i className="fas fa-cogs me-1"></i> Service Failures
                            </button>
                            <button
                                className="btn btn-danger btn-sm rounded-pill px-3 shadow-sm"
                                onClick={() => runPrefetchSearch("error", "system")}
                                title="System error events"
                            >
                                <i className="fas fa-times-circle me-1"></i> System Errors
                            </button>
                            <button
                                className="btn btn-sm rounded-pill px-3 shadow-sm text-white"
                                style={{ backgroundColor: "#20c997" }}
                                onClick={() => runPrefetchSearch("12 OR 13", "system")}
                                title="System startup and shutdown events"
                            >
                                <i className="fas fa-sync-alt me-1"></i> System Start/Stop
                            </button>

                            {/* Defender Events */}
                            <button
                                className="btn btn-sm rounded-pill px-3 shadow-sm text-white"
                                style={{ backgroundColor: "#e83e8c" }}
                                onClick={() => runPrefetchSearch("threat", "defender")}
                                title="Windows Defender threat detections"
                            >
                                <i className="fas fa-shield-alt me-1"></i> Defender Threats
                            </button>
                            <button
                                className="btn btn-info btn-sm rounded-pill px-3 shadow-sm text-white"
                                onClick={() => runPrefetchSearch("scan", "defender")}
                                title="Defender scan results"
                            >
                                <i className="fas fa-search me-1"></i> Scan Results
                            </button>

                            {/* General Searches */}
                            <button
                                className="btn btn-warning btn-sm rounded-pill px-3 shadow-sm"
                                onClick={() => runPrefetchSearch("warning", "system")}
                                title="System warning events"
                            >
                                <i className="fas fa-exclamation-triangle me-1"></i> Warnings
                            </button>
                        </div>
                    </div>

                    {/* Search Controls */}
                    <div className="input-group mb-4">
                        <span className="input-group-text bg-dark border-dark text-white">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control bg-dark text-white border-white"
                            placeholder="Search logs…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                        <select
                            className="form-select bg-dark text-white border-white mx-2"
                            value={table}
                            onChange={e => setTable(e.target.value)}
                            style={{ maxWidth: '150px' }}
                        >
                            <option value="security">Security</option>
                            <option value="system">System</option>
                            <option value="defender">Defender</option>
                            <option value="agent">Agent</option>
                        </select>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <i className="fas fa-exclamation-circle me-2"></i>{error}
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="text-center p-3">
                            <span className="spinner-border spinner-border-sm text-primary me-2"></span>
                            <span className={theme === 'light-mode' ? 'text-light' : 'text-muted'}>Searching…</span>
                        </div>
                    )}

                    {/* Results List */}
                    {!loading && results.length > 0 && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                <span className={`fw-bold ${theme === 'light-mode' ? 'text-light' : 'text-white'}`}>
                                    Found <span className="badge bg-primary">{results.length}</span> result(s) across <span className="badge bg-info">{Object.keys(groupedResults).length}</span> host(s)
                                </span>
                            </div>

                            <MDBAccordion initialActive={1}>
                                {Object.entries(groupedResults).map(([hostname, hostResults], index) => (
                                    <MDBAccordionItem
                                        collapseId={index + 1}
                                        headerTitle={`${hostname} (${hostResults.length} result${hostResults.length !== 1 ? 's' : ''})`}
                                        key={hostname}
                                        className="mb-3 border border-dark rounded shadow-5-strong"
                                    >
                                        <div className={`p-3 ${theme === 'light-mode' ? 'bg-light text-dark' : ''}`} style={theme === 'dark-mode' ? { backgroundColor: "#2b2b3c", color: "white", borderRadius: "5px" } : { borderRadius: "5px" }}>
                                            <div className="table-responsive">
                                                <table className={`table table-sm table-hover ${theme === 'dark-mode' ? 'table-dark table-striped' : 'table-striped'}`}>
                                                    <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                                        <tr>
                                                            <th className="text-uppercase text-nowrap">Timestamp</th>
                                                            <th className="text-uppercase">Message</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {hostResults.map(row => (
                                                            <tr
                                                                key={row.id}
                                                                onClick={() => openDetail(row)}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                <td className="text-nowrap">{row.timestamp}</td>
                                                                <td>{row.message?.slice(0, 120)}…</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </MDBAccordionItem>
                                ))}
                            </MDBAccordion>
                        </div>
                    )}

                    {/* No results */}
                    {!loading && query && results.length === 0 && (
                        <p className={theme === 'light-mode' ? 'text-secondary text-center m-0' : 'text-muted text-center m-0'}>
                            No results found for "{query}" {currentHost ? `on ${currentHost}` : "across all hosts"}.
                        </p>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selected && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ background: "rgba(0,0,0,0.7)", zIndex: 1050 }}
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="rounded shadow-5-strong p-4"
                        style={{
                            backgroundColor: theme === 'dark-mode' ? "#1e1e2f" : "white",
                            color: theme === 'dark-mode' ? "white" : "black",
                            width: "650px",
                            maxHeight: "80vh",
                            overflowY: "auto"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                            <h4 className="mb-0"><i className="fas fa-file-alt me-2 text-primary"></i>Log Details</h4>
                            <button className="btn-close btn-close-white" onClick={() => setSelected(null)}></button>
                        </div>

                        <pre
                            className="rounded p-3"
                            style={{
                                backgroundColor: theme === 'dark-mode' ? "#2b2b3c" : "#f7f7f7",
                                color: theme === 'dark-mode' ? "#e0e0e0" : "#333",
                                whiteSpace: "pre-wrap",
                                fontSize: "12px",
                                maxHeight: "55vh",
                                overflowY: "auto"
                            }}
                        >
{JSON.stringify(selected, null, 2)}
                        </pre>

                        <div className="text-end mt-3">
                            <MDBBtn color="secondary" onClick={() => setSelected(null)}>
                                <i className="fas fa-times me-2"></i>Close
                            </MDBBtn>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}