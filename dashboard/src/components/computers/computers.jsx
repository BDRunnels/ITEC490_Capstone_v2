// import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { HostContext } from '../../context/HostContext';

// const Computers = () => {
//   const { currentHost, setCurrentHost, theme } = useContext(HostContext);
//   const navigate = useNavigate();
//   const [hosts, setHosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [hoveredHost, setHoveredHost] = useState(null);

//   useEffect(() => {
//     const fetchHosts = async () => {
//       try {
//         const response = await fetch('/api/reports?type=hardware');
//         if (!response.ok) throw new Error('Failed to fetch hosts data');
//         const data = await response.json();
        
//         // Extract unique hosts dynamically from hardware logs API
//         const uniqueHostsMap = new Map();
//         data.forEach(log => {
//           if (log.hostname && !uniqueHostsMap.has(log.hostname)) {
//             uniqueHostsMap.set(log.hostname, log); // Store the latest hardware info
//           }
//         });
        
//         setHosts(Array.from(uniqueHostsMap.values()));
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHosts();
//     const intervalId = setInterval(fetchHosts, 5000);
//     return () => clearInterval(intervalId);
//   }, []);

//   return (
//     <div style={{ marginTop: '20px' }}>
//       <h1 className="text-center mb-4">Computers</h1>
//       <div className="container" style={{ maxWidth: '1000px' }}>
        
//         {loading && (
//           <div className="text-center my-5">
//             <div className="spinner-border text-primary" role="status">
//                <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}

//         {error && (
//             <div className="alert alert-danger text-center" role="alert">
//                 {error}
//             </div>
//         )}

//         {!loading && !error && hosts.length === 0 && (
//           <div className="bg-image mt-4 mb-5 mx-auto p-5 rounded text-center text-white shadow" style={{ backgroundColor: "#1e1e2f" }}>
//             <h4>No Computers Found</h4>
//             <p>Ensure your SIEM Agents are running on the end user machines.</p>
//           </div>
//         )}

//         {!loading && !error && hosts.length > 0 && (
//            <div className={`p-4 rounded shadow ${theme === 'light-mode' ? 'border border-dark' : ''}`}>
//              <div className="row">
//                {hosts.map((host) => (
//                   <div className="col-md-6 col-lg-4 mb-4" key={host.hostname}>
//                      <div 
//                         className="card h-100 shadow-sm"
//                         style={{ 
//                             cursor: 'pointer',
//                             backgroundColor: currentHost === host.hostname ? '#0d6efd' : '#2b2b3c',
//                             color: 'white',
//                             border: currentHost === host.hostname ? '2px solid white' : '1px solid #4d4d5b',
//                             transition: 'all 0.2s ease-in-out'
//                         }}
//                         onClick={() => {
//                           if (currentHost === host.hostname) {
//                              setCurrentHost(null);
//                           } else {
//                              setCurrentHost(host.hostname);
//                           }
//                         }}
//                         onMouseEnter={() => setHoveredHost(host.hostname)}
//                         onMouseLeave={() => setHoveredHost(null)}
//                      >
//                        <div className="card-body text-center d-flex flex-column align-items-center justify-content-center position-relative">
//                           <i className={`fas fa-laptop fs-1 mb-3 ${currentHost === host.hostname ? 'text-white' : 'text-primary'}`}></i>
//                           <h5 className="card-title fw-bold mb-0">{host.hostname}</h5>
//                           {host.os && <small className="mt-2" style={{color: '#ccc'}}>{host.os}</small>}
//                           {host.ip && <small className="" style={{color: '#ccc'}}>IP: {host.ip}</small>}
                          
//                           {/* Quick View Logs & Kill Agent Buttons on Hover */}
//                         {hoveredHost === host.hostname && (
//                           <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
//                                style={{ top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 'inherit' }}>
//                              <button 
//                                 className="btn btn-primary shadow-sm mb-2"
//                                 onClick={(e) => {
//                                   e.stopPropagation(); // Prevent card selection toggle
//                                   setCurrentHost(host.hostname);
//                                   navigate('/logs');
//                                 }}
//                              >
//                                 <i className="fas fa-list me-2"></i>View Logs
//                              </button>
//                              <button 
//                                 className="btn btn-danger shadow-sm btn-sm"
//                                 onClick={async (e) => {
//                                   e.stopPropagation();
//                                   const pwd = window.prompt(`WARNING: Are you sure you want to terminate the SIEM Agent permanently on "${host.hostname}"?\n\nEnter administrator password to confirm:`);
//                                   if (pwd !== "admin") {
//                                       if (pwd !== null) alert("Incorrect administrator password. Termination aborted.");
//                                       return;
//                                   }
                                  
//                                   const killCmd = "Remove-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name 'SIEMAgent' -ErrorAction SilentlyContinue; Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { (Get-CimInstance Win32_Process -Filter \\\"ProcessId=$($_.Id)\\\").CommandLine -match \\\"siem-agent.ps1\\\" } | Stop-Process -Force";
//                                   try {
//                                       await fetch("/api/commands", {
//                                           method: "POST",
//                                           headers: {"Content-Type": "application/json"},
//                                           body: JSON.stringify({ hostname: host.hostname, command: killCmd })
//                                       });
//                                       alert(`Termination signal queued for ${host.hostname}.`);
//                                   } catch (err) {
//                                       alert(`Error queuing termination: ${err}`);
//                                   }
//                                 }}
//                              >
//                                 <i className="fas fa-skull-crossbones me-2"></i>Kill Agent
//                              </button>
//                           </div>
//                         )}
//                        </div>
//                      </div>
//                   </div>
//                ))}
//              </div>
//            </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default Computers;

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HostContext } from '../../context/HostContext';
import { MDBBtn } from 'mdb-react-ui-kit';

const Computers = () => {
  const { currentHost, setCurrentHost, theme, apiBase } = useContext(HostContext);
  const navigate = useNavigate();
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredHost, setHoveredHost] = useState(null);

  /* ----------------------------------------------------
     HEARTBEAT COLOR LOGIC (from old dashboard)
  ---------------------------------------------------- */
  const getStatusColor = (timestamp) => {
    if (!timestamp) return "red";

    const last = new Date(timestamp);
    const now = new Date();
    const diffMs = now - last;
    const diffMin = diffMs / 1000 / 60;

    if (diffMin < 2) return "limegreen";  // online
    if (diffMin < 4) return "gold";       // warning
    return "red";                         // offline
  };

  /* ----------------------------------------------------
     FETCH HOSTS + MERGE OLD LOGIC
  ---------------------------------------------------- */
  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const response = await fetch(`${apiBase}/api/reports?type=agent`);
        if (!response.ok) throw new Error('Failed to fetch hosts data');
        const data = await response.json();

        // Build unique host list with latest timestamp
        const uniqueHostsMap = new Map();

        data.forEach(log => {
          if (!log.hostname) return;

          const existing = uniqueHostsMap.get(log.hostname);

          // Keep the most recent timestamp
          if (!existing || new Date(log.timestamp) > new Date(existing.timestamp)) {
            uniqueHostsMap.set(log.hostname, log);
          }
        });

        let hostArray = Array.from(uniqueHostsMap.values());

        /* ----------------------------------------------------
           SORTING (online → warning → offline → alphabetical)
        ---------------------------------------------------- */
        hostArray.sort((a, b) => {
          const colorA = getStatusColor(a.timestamp);
          const colorB = getStatusColor(b.timestamp);

          const priority = { "limegreen": 1, "gold": 2, "red": 3 };

          if (priority[colorA] !== priority[colorB]) {
            return priority[colorA] - priority[colorB];
          }

          return a.hostname.localeCompare(b.hostname);
        });

        setHosts(hostArray);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
    const intervalId = setInterval(fetchHosts, 5000);
    return () => clearInterval(intervalId);
  }, []);

  /* ----------------------------------------------------
     UI RENDER
  ---------------------------------------------------- */
  return (
    <div style={{ marginTop: '20px' }}>
      <h1 className="text-center mb-4">Computers</h1>
      <div className="container" style={{ maxWidth: '1000px' }}>

        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
               <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && (
            <div className="alert alert-danger text-center" role="alert">
                {error}
            </div>
        )}

        {!loading && !error && hosts.length === 0 && (
          <div className={`mt-4 mb-5 mx-auto p-5 rounded text-center ${theme === 'light-mode' ? 'bg-light text-dark border border-dark' : 'bg-image text-white'}`} style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.85)', ...(theme === 'dark-mode' ? { backgroundColor: "#1e1e2f" } : {}) }}>
            <h4>No Computers Found</h4>
            <p>Ensure your SIEM Agents are running on the end user machines.</p>
          </div>
        )}

        {!loading && !error && hosts.length > 0 && (
           <div className={`p-4 rounded ${theme === 'light-mode' ? 'bg-light text-dark border border-dark' : ''}`} style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.85)' }}>
             <div className="row">
               {hosts.map((host) => (
                  <div className="col-md-6 col-lg-4 mb-4" key={host.hostname}>
                     <div 
                        className="card h-100 shadow-sm"
                        style={{ 
                            cursor: 'pointer',
                            backgroundColor: currentHost === host.hostname ? '#0d6efd' : '#2b2b3c',
                            color: 'white',
                            border: currentHost === host.hostname ? '2px solid white' : '1px solid #4d4d5b',
                            transition: 'all 0.2s ease-in-out',
                            position: "relative"
                        }}
                        onClick={() => {
                          setCurrentHost(currentHost === host.hostname ? null : host.hostname);
                        }}
                        onMouseEnter={() => setHoveredHost(host.hostname)}
                        onMouseLeave={() => setHoveredHost(null)}
                     >

                       {/* STATUS DOT (heartbeat) */}
                       <div
                         style={{
                           position: "absolute",
                           top: "10px",
                           right: "10px",
                           width: "14px",
                           height: "14px",
                           borderRadius: "50%",
                           backgroundColor: getStatusColor(host.timestamp),
                           border: "2px solid white",
                           boxShadow: "0 0 6px rgba(0,0,0,0.5)"
                         }}
                       ></div>

                       <div className="card-body text-center d-flex flex-column align-items-center justify-content-center position-relative">
                          <i className={`fas fa-laptop fs-1 mb-3 ${currentHost === host.hostname ? 'text-white' : 'text-primary'}`}></i>
                          <h5 className="card-title fw-bold mb-0">{host.hostname}</h5>

                          {host.os && <small className="mt-2" style={{color: '#ccc'}}>{host.os}</small>}
                          {host.ip && <small style={{color: '#ccc'}}>IP: {host.ip}</small>}

                          {host.timestamp && (
                            <small style={{ color: "#bbb" }}>
                              Last check‑in: {new Date(host.timestamp).toLocaleString()}
                            </small>
                          )}

                          {/* Hover overlay */}
                          {hoveredHost === host.hostname && (
                            <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
                                 style={{ top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 'inherit' }}>
                               <MDBBtn 
                                  color="primary" className="shadow-sm mb-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentHost(host.hostname);
                                    navigate('/logs');
                                  }}
                               >
                                  <i className="fas fa-list me-2"></i>View Logs
                               </MDBBtn>

                               <MDBBtn 
                                  color="danger" size="sm" className="shadow-sm"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const pwd = window.prompt(`WARNING: Are you sure you want to terminate the SIEM Agent permanently on "${host.hostname}"?\n\nEnter administrator password to confirm:`);
                                    if (pwd !== "admin") {
                                        if (pwd !== null) alert("Incorrect administrator password. Termination aborted.");
                                        return;
                                    }
                                    
                                    const killCmd = "Remove-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name 'SIEMAgent' -ErrorAction SilentlyContinue; Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { (Get-CimInstance Win32_Process -Filter \\\"ProcessId=$($_.Id)\\\").CommandLine -match \\\"siem-agent.ps1\\\" } | Stop-Process -Force";
                                    try {
                                        await fetch(`${apiBase}/api/commands`, {
                                            method: "POST",
                                            headers: {"Content-Type": "application/json"},
                                            body: JSON.stringify({ hostname: host.hostname, command: killCmd })
                                        });
                                        alert(`Termination signal queued for ${host.hostname}.`);
                                    } catch (err) {
                                        alert(`Error queuing termination: ${err}`);
                                    }
                                  }}
                               >
                                  <i className="fas fa-skull-crossbones me-2"></i>Kill Agent
                               </MDBBtn>
                            </div>
                          )}

                       </div>
                     </div>
                  </div>
               ))}
             </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default Computers;
