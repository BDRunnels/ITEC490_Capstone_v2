// import React, { useState, useContext } from 'react';
// import { HostContext } from '../../context/HostContext';
// import { MDBBtn } from 'mdb-react-ui-kit';

// const Admin = () => {
//   const { theme } = useContext(HostContext);
//   const [password, setPassword] = useState("");
//   const [isUnlocked, setIsUnlocked] = useState(false);
//   const [error, setError] = useState(null);
//   const [statusMsg, setStatusMsg] = useState(null);
//   const [isWiping, setIsWiping] = useState(false);
//   const [isSeeding, setIsSeeding] = useState(false);
//   const [isUnseeding, setIsUnseeding] = useState(false);
  
//   const handleUnlock = (e) => {
//     e.preventDefault();
//     if (password === "admin") {
//       setIsUnlocked(true);
//       setError(null);
//     } else {
//       setError("Incorrect administrator password.");
//     }
//   };

//   const handleWipeDatabase = async () => {
//     if (!window.confirm("WARNING: This will permanently purge all hardware, security, system, defender, and agent logs from the database. It cannot be undone. Are you sure?")) {
//       return;
//     }
    
//     setIsWiping(true);
//     setStatusMsg(null);
//     setError(null);

//     try {
//       const response = await fetch("/api/wipe", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ password: password })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok || data.status === "error") {
//         throw new Error(data.message || "Failed to wipe database");
//       }
      
//       setStatusMsg("Database completely wiped successfully. Command history preserved.");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsWiping(false);
//     }
//   };

//   const handleSeedAction = async (endpoint, actionName, setter) => {
//     setter(true);
//     setStatusMsg(null);
//     setError(null);
//     try {
//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ password: password })
//       });
//       const data = await response.json();
//       if (!response.ok || data.status === "error") throw new Error(data.message || `Failed to ${actionName}`);
//       setStatusMsg(data.message);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setter(false);
//     }
//   };

//   return (
//     <div style={{ marginTop: '20px' }}>
//       <h1 className="text-center mb-4">Administrator Access</h1>
      
//       <div className="container" style={{ maxWidth: '800px' }}>
//         <div className={`p-5 rounded shadow text-center ${theme === 'light-mode' ? 'bg-light border border-dark' : 'text-white'}`} style={theme === 'dark-mode' ? { backgroundColor: "#1e1e2f" } : {}}>
          
//           {!isUnlocked ? (
//              <form onSubmit={handleUnlock} className="mx-auto" style={{ maxWidth: "400px" }}>
//                <i className="fas fa-lock fa-3x mb-4 text-warning"></i>
//                <h4 className="mb-4">Protected Area</h4>
//                <p className={theme === 'light-mode' ? 'text-muted' : 'text-secondary'}>Enter the terminal administrator password to manage active agents and securely wipe the SIEM database history.</p>
               
//                <div className="input-group mb-3 mt-4">
//                  <span className="input-group-text bg-dark border-dark text-white"><i className="fas fa-key"></i></span>
//                  <input 
//                     type="password" 
//                     className="form-control bg-dark border-dark text-white" 
//                     placeholder="Enter password..." 
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                  />
//                  <button className="btn btn-warning" type="submit">Unlock</button>
//                </div>
               
//                {error && <div className="alert alert-danger mt-3">{error}</div>}
//              </form>
//           ) : (
//              <div>             
//                {statusMsg && <div className="alert alert-success">{statusMsg}</div>}
//                {error && <div className="alert alert-danger">{error}</div>}
               
//                <div className="row mt-5 text-start">
//                  {/* Agent Scripts Generation Column */}
//                  <div className="col-md-4 mb-4">
//                     <div className="p-4 h-100 rounded border border-warning" style={{ backgroundColor: theme === 'dark-mode' ? "#2b2b3c" : "#fff" }}>
//                       <h5><i className="fas fa-download text-warning me-2"></i> Agent Distributions</h5>
//                       <p className={`small mb-4 ${theme === 'light-mode' ? 'text-muted' : 'text-secondary'}`}>Download pre-packaged SIEM script installers or terminal disruption payloads to physically run on target systems.</p>
                      
//                       <div className="d-grid gap-3">
//                          <MDBBtn tag="a" href="/api/generate-agent.ps1" outline color="warning" className="hover-shadow" download>
//                            <i className="fas fa-file-archive me-2"></i> Download Agent Bundle
//                          </MDBBtn>
//                          <MDBBtn tag="a" href="/api/generate-kill-script" outline color="danger" className="hover-shadow" download>
//                            <i className="fas fa-skull-crossbones me-2"></i> Download Kill Script
//                          </MDBBtn>
//                       </div>
//                     </div>
//                  </div>

//                  {/* Dummy Data Engineering Column */}
//                  <div className="col-md-4 mb-4">
//                     <div className="p-4 h-100 rounded border border-info" style={{ backgroundColor: theme === 'dark-mode' ? "#2b2b3c" : "#fff" }}>
//                       <h5><i className="fas fa-flask text-info me-2"></i> Testing Utilities</h5>
//                       <p className={`small mb-4 ${theme === 'light-mode' ? 'text-muted' : 'text-secondary'}`}>Instantly populate the active master database with artificial Virtual Machine network topology models and threat events.</p>
                      
//                       <div className="d-grid gap-3 mt-auto">
//                          <MDBBtn onClick={() => handleSeedAction("/api/seed", "seed data", setIsSeeding)} outline color="info" className="hover-shadow" disabled={isSeeding}>
//                            {isSeeding ? 'Injecting...' : <><i className="fas fa-syringe me-2"></i> Inject Dummy Data</>}
//                          </MDBBtn>
//                          <MDBBtn onClick={() => handleSeedAction("/api/unseed", "unseed data", setIsUnseeding)} outline color="secondary" className="hover-shadow" disabled={isUnseeding}>
//                            {isUnseeding ? 'Removing...' : <><i className="fas fa-eraser me-2"></i> Remove Dummy Data</>}
//                          </MDBBtn>
//                       </div>
//                     </div>
//                  </div>

//                  {/* Database Management Column */}
//                  <div className="col-md-4 mb-4">
//                     <div className="p-4 h-100 rounded border border-danger" style={{ backgroundColor: theme === 'dark-mode' ? "#2b2b3c" : "#fff" }}>
//                       <h5><i className="fas fa-database text-danger me-2"></i> Vault Management</h5>
//                       <p className={`small mb-4 ${theme === 'light-mode' ? 'text-muted' : 'text-secondary'}`}>Trigger an immediate, irreversible wipe of all aggregated telemetry logs. Command history is uniquely preserved.</p>
                      
//                       <div className="d-grid mt-auto">
//                          <MDBBtn onClick={handleWipeDatabase} color="danger" className="hover-shadow" disabled={isWiping}>
//                            {isWiping ? 'Wiping...' : <><i className="fas fa-fire me-2"></i> Purge Database</>}
//                          </MDBBtn>
//                       </div>
//                     </div>
//                  </div>
//                </div>

//                <button className="btn btn-secondary mt-4" onClick={() => {setIsUnlocked(false); setPassword(""); setStatusMsg(null);}}>
//                  <i className="fas fa-sign-out-alt me-2"></i> Lock Terminal
//                </button>

//              </div>
//           )}
          
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Admin;

import React, { useState, useContext } from 'react';
import { HostContext } from '../../context/HostContext';
import { MDBBtn } from 'mdb-react-ui-kit';

const Admin = () => {
  const { theme, apiBase } = useContext(HostContext);

  // For file downloads we always need an absolute URL
  const downloadBase = apiBase || `http://${window.location.hostname}:5000`;

  const downloadAgent = () => {
    window.location.href = `${downloadBase}/api/generate-agent.ps1?host=${window.location.hostname}`;
  };

  const downloadKillScript = () => {
    window.location.href = `${downloadBase}/api/generate-kill-script?host=${window.location.hostname}`;
  };
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isWiping, setIsWiping] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isUnseeding, setIsUnseeding] = useState(false);
  
  
  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === "admin") {
      setIsUnlocked(true);
      setError(null);
    } else {
      setError("Incorrect administrator password.");
    }
  };

  const handleWipeDatabase = async () => {
    if (!window.confirm("WARNING: This will permanently purge all hardware, security, system, defender, and agent logs from the database. It cannot be undone. Are you sure?")) {
      return;
    }
    
    setIsWiping(true);
    setStatusMsg(null);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/api/wipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password })
      });
      
      const data = await response.json();
      
      if (!response.ok || data.status === "error") {
        throw new Error(data.message || "Failed to wipe database");
      }
      
      setStatusMsg("Database completely wiped successfully. Command history preserved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsWiping(false);
    }
  };

  const handleSeedAction = async (endpoint, actionName, setter) => {
    setter(true);
    setStatusMsg(null);
    setError(null);
    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password })
      });
      const data = await response.json();
      if (!response.ok || data.status === "error") throw new Error(data.message || `Failed to ${actionName}`);
      setStatusMsg(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setter(false);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h1 className="text-center mb-4">Admin</h1>
      
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className={`p-5 rounded shadow text-center ${theme === 'light-mode' ? 'bg-light border border-dark' : 'text-white'}`} style={theme === 'dark-mode' ? { backgroundColor: "#1e1e2f" } : {}}>
             <div>             
               {statusMsg && <div className="alert alert-success">{statusMsg}</div>}
               {error && <div className="alert alert-danger">{error}</div>}
               
               <div className="row mt-5 text-start">
                 {/* Agent Scripts Generation Column */}
                 <div className="col-md-4 mb-4">
                    <div className="p-4 h-100 rounded border border-warning" style={{ backgroundColor: theme === 'dark-mode' ? "#2b2b3c" : "#fff" }}>
                      <h5><i className="fas fa-download text-warning me-2"></i> Agent Distributions</h5>
                      <p className={`small mb-4 ${theme === 'light-mode' ? 'text-muted' : 'text-secondary'}`}>Download pre-packaged SIEM script installers or terminal disruption payloads to physically run on target systems.</p>
                      
                      <div className="d-grid gap-3">
                          <MDBBtn tag="a" onClick={downloadAgent} outline color="warning" className="hover-shadow">
                            <i className="fas fa-file-archive me-2"></i> Download Agent Bundle
                          </MDBBtn>

                          <MDBBtn tag="a" onClick={downloadKillScript} outline color="danger" className="hover-shadow" download>
                           <i className="fas fa-skull-crossbones me-2"></i> Download Kill Script
                          </MDBBtn>
                      </div>
                    </div>
                 </div>

                 {/* Dummy Data Engineering Column */}
                 <div className="col-md-4 mb-4">
                    <div className="p-4 h-100 rounded border border-info" style={{ backgroundColor: theme === 'dark-mode' ? "#2b2b3c" : "#fff" }}>
                      <h5><i className="fas fa-flask text-info me-2"></i> Testing Utilities</h5>
                      <p className={`small mb-4 ${theme === 'light-mode' ? 'text-muted' : 'text-secondary'}`}>Instantly populate the active master database with artificial Virtual Machine network topology models and threat events.</p>
                      
                      <div className="d-grid gap-3 mt-auto">
                         <MDBBtn onClick={() => handleSeedAction("/api/seed", "seed data", setIsSeeding)} outline color="info" className="hover-shadow" disabled={isSeeding}>
                           {isSeeding ? 'Injecting...' : <><i className="fas fa-syringe me-2"></i> Inject Dummy Data</>}
                         </MDBBtn>
                         <MDBBtn onClick={() => handleSeedAction("/api/unseed", "unseed data", setIsUnseeding)} outline color="secondary" className="hover-shadow" disabled={isUnseeding}>
                           {isUnseeding ? 'Removing...' : <><i className="fas fa-eraser me-2"></i> Remove Dummy Data</>}
                         </MDBBtn>
                      </div>
                    </div>
                 </div>

                 {/* Database Management Column */}
                 <div className="col-md-4 mb-4">
                    <div className="p-4 h-100 rounded border border-danger" style={{ backgroundColor: theme === 'dark-mode' ? "#2b2b3c" : "#fff" }}>
                      <h5><i className="fas fa-database text-danger me-2"></i> Vault Management</h5>
                      <p className={`small mb-4 ${theme === 'light-mode' ? 'text-muted' : 'text-secondary'}`}>Trigger an immediate, irreversible wipe of all aggregated telemetry logs. Command history is uniquely preserved.</p>
                      
                      <div className="d-grid mt-auto">
                         <MDBBtn onClick={handleWipeDatabase} color="danger" className="hover-shadow" disabled={isWiping}>
                           {isWiping ? 'Wiping...' : <><i className="fas fa-fire me-2"></i> Purge Database</>}
                         </MDBBtn>
                      </div>
                    </div>
                 </div>
               </div>

               <button className="btn btn-secondary mt-4" onClick={() => {setIsUnlocked(false); setPassword(""); setStatusMsg(null);}}>
                 <i className="fas fa-sign-out-alt me-2"></i> Lock Terminal
               </button>

             </div>
          
        </div>
      </div>
    </div>
  );
};

export default Admin;
