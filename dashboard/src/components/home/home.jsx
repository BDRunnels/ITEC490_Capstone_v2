import React, { useContext } from 'react';
import { HostContext } from '../../context/HostContext';

const Home = () => {
  const { theme } = useContext(HostContext);

  return (
    <div style={{ marginTop: '20px' }}>
      <h1 className="text-center mb-4">The Logfather SIEM Dashboard</h1>
      <div className="container" style={{ maxWidth: '1000px'}}>
        <div 
          className={`p-5 rounded ${theme === 'light-mode' ? 'bg-light text-dark border border-dark' : 'text-white'}`} 
          style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.85)', ...(theme === 'dark-mode' ? { backgroundColor: "#1e1e2f" } : {}) }}
        >
          <h3 className="mb-4 text-center border-bottom pb-3">How It Works</h3>
          
          <div className="row g-4 mt-2">
            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <i className="fas fa-download fa-2x text-warning me-3"></i>
                <div>
                  <h5 className="fw-bold mb-1">1. Deploy Agents</h5>
                  <p className={theme === 'light-mode' ? 'text-secondary' : 'text-muted'}>Go to the Admin page to download the SIEM agent script. Run it on your target endpoint to start collecting logs.</p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <i className="fas fa-laptop fa-2x text-primary me-3"></i>
                <div>
                  <h5 className="fw-bold mb-1">2. Select a Machine</h5>
                  <p className={theme === 'light-mode' ? 'text-secondary' : 'text-muted'}>Navigate to the Computers page to view all connected endpoints. Click on a machine to select it.</p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <i className="fas fa-list-alt fa-2x text-info me-3"></i>
                <div>
                  <h5 className="fw-bold mb-1">3. Review Logs</h5>
                  <p className={theme === 'light-mode' ? 'text-secondary' : 'text-muted'}>Use the Logs tab to fetch and analyze real-time Hardware, Security, System, and Windows Defender logs.</p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <i className="fas fa-search fa-2x text-success me-3"></i>
                <div>
                  <h5 className="fw-bold mb-1">4. Search & Investigate</h5>
                  <p className={theme === 'light-mode' ? 'text-secondary' : 'text-muted'}>The Search page allows for searching the entire database or a selected endpoint.</p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <i className="fas fa-terminal fa-2x text-danger me-3"></i>
                <div>
                  <h5 className="fw-bold mb-1">5. Active Response</h5>
                  <p className={theme === 'light-mode' ? 'text-secondary' : 'text-muted'}>Visit the Scripts page to push PowerShell commands to the selected endpoint.</p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <i className="fas fa-shield-alt fa-2x text-secondary me-3"></i>
                <div>
                  <h5 className="fw-bold mb-1">6. Threat Intel</h5>
                  <p className={theme === 'light-mode' ? 'text-secondary' : 'text-muted'}>Check the CVE section to browse the latest vulnerabilities from the National Vulnerability Database.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Home;
