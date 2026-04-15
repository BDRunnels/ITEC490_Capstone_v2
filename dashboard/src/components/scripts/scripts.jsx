import React, { useContext, useState } from 'react';
import { HostContext } from '../../context/HostContext';
import { MDBBtn, MDBInput, MDBTextArea, MDBCard, MDBCardBody, MDBCardTitle } from 'mdb-react-ui-kit';

const Scripts = () => {
  const { currentHost, theme, apiBase } = useContext(HostContext);
  const [loading, setLoading] = useState(false);

  // States for the 4 containers
  const [filePath, setFilePath] = useState('');
  const [userInfo, setUserInfo] = useState({ username: '', password: '' });
  const [ports, setPorts] = useState('');
  const [customScript, setCustomScript] = useState('');

  const sendCommand = async (commandDesc, scriptContent) => {
    if (!currentHost) {
      alert("Select a workstation first.");
      return;
    }
    if (!scriptContent.trim()) {
      alert("Missing required input for this action.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostname: currentHost,
          command: scriptContent
        })
      });

      if (res.ok) {
        alert(`${commandDesc} command queued for ${currentHost}.`);
      } else {
        alert("Failed to queue command.");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 1. Delete File
  const handleDeleteFile = () => {
    const script = `Remove-Item -Path "${filePath}" -Force -Recurse -ErrorAction SilentlyContinue`;
    sendCommand("Delete File", script);
    setFilePath('');
  };

  // 2. Sign Out & Change Password
  const handleUserSignOut = () => {
    // This script changes the password and forces logoff for the user
    const script = `
$user = "${userInfo.username}"
$pass = "${userInfo.password}"
net user $user $pass
$sessions = query session | Select-String $user
foreach($s in $sessions) {
    if ($s.Line -match "(\\s*\\S+\\s+){1,2}(\\d+)\\s+") {
        $id = $matches[2]
        logoff $id
    }
}
    `.trim();
    sendCommand("Sign Out & Password Change", script);
    setUserInfo({ username: '', password: '' });
  };

  // 3. Close Ports
  const handleClosePorts = () => {
    const portList = ports.split(',').map(p => p.trim()).filter(Boolean).join(',');
    const script = `
New-NetFirewallRule -DisplayName "SIEM Block Ports ${portList}" -Direction Inbound -LocalPort ${portList} -Protocol TCP -Action Block
New-NetFirewallRule -DisplayName "SIEM Block Ports ${portList}" -Direction Outbound -LocalPort ${portList} -Protocol TCP -Action Block
New-NetFirewallRule -DisplayName "SIEM Block Ports ${portList} UDP" -Direction Inbound -LocalPort ${portList} -Protocol UDP -Action Block
New-NetFirewallRule -DisplayName "SIEM Block Ports ${portList} UDP" -Direction Outbound -LocalPort ${portList} -Protocol UDP -Action Block
    `.trim();
    sendCommand("Close Ports", script);
    setPorts('');
  };

  // 4. Custom Script
  const handleCustomScript = () => {
    sendCommand("Custom Script", customScript);
    setCustomScript('');
  };

  // 5. Reboot VM
  const handleReboot = () => {
    if (window.confirm(`Are you sure you want to REBOOT the virtual machine ${currentHost}?`)) {
      sendCommand("Reboot VM", "Restart-Computer -Force");
    }
  };

  if (!currentHost) {
    return (
      <div style={{ marginTop: '20px' }}>
        <h1 className="text-center mb-4">Remote Maintenance Scripts</h1>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className={`p-5 rounded text-center ${theme === 'light-mode' ? 'bg-light text-dark border border-dark' : 'text-white'}`} style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.85)', ...(theme === 'dark-mode' ? { backgroundColor: "#1e1e2f" } : {}) }}>
            <h4>Please select a Virtual Machine</h4>
            <p className={theme === 'light-mode' ? 'text-secondary' : 'text-muted'}>You must select an active VM from the Computers page to run remote scripts.</p>
          </div>
        </div>
      </div>
    );
  }

  const cardStyle = {
    boxShadow: '0 10px 25px rgba(0,0,0,0.85)',
    ...(theme === 'dark-mode' ? { backgroundColor: '#2b2b3c', color: 'white' } : { backgroundColor: '#f8f9fa' })
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h1 className="text-center mb-2 text-uppercase">Execute Actions on: <span className="text-primary">{currentHost}</span></h1>
      <div className="text-center mb-4">
        <MDBBtn color="danger" onClick={handleReboot} disabled={loading}>
          <i className="fas fa-power-off me-2"></i> Reboot {currentHost}
        </MDBBtn>
      </div>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div className="row g-4 mb-5">
          
          {/* Card 1: Delete File */}
          <div className="col-md-6">
            <MDBCard className={`h-100 ${theme === 'light-mode' ? 'border border-dark' : 'border-0'}`} style={cardStyle}>
              <MDBCardBody>
                <MDBCardTitle className="d-flex align-items-center mb-3 text-danger fw-bold">
                  <i className="fas fa-trash-alt me-2 fs-4"></i> Delete File/Folder
                </MDBCardTitle>
                <p className="small mb-4 text-muted">Forcefully remove a file or directory on the target system.</p>
                <MDBInput 
                  label="Absolute File Path (e.g. C:\Temp\malware.exe)" 
                  value={filePath} 
                  onChange={(e) => setFilePath(e.target.value)} 
                  className="mb-3"
                  contrast={theme === 'dark-mode'}
                />
                <MDBBtn color="danger" className="w-100" onClick={handleDeleteFile} disabled={loading || !filePath}>
                   Execute Deletion
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </div>

          {/* Card 2: User Sign Out / Password Change */}
          <div className="col-md-6">
            <MDBCard className={`h-100 ${theme === 'light-mode' ? 'border border-dark' : 'border-0'}`} style={cardStyle}>
              <MDBCardBody>
                <MDBCardTitle className="d-flex align-items-center mb-3 text-warning fw-bold">
                  <i className="fas fa-user-lock me-2 fs-4"></i> Lock User Account
                </MDBCardTitle>
                <p className="small mb-4 text-muted">Change user password and immediately forcefully log their active session off.</p>
                <MDBInput 
                  label="Target Username" 
                  value={userInfo.username} 
                  onChange={(e) => setUserInfo({...userInfo, username: e.target.value})} 
                  className="mb-3"
                  contrast={theme === 'dark-mode'}
                />
                <MDBInput 
                  label="New Secure Password" 
                  value={userInfo.password} 
                  onChange={(e) => setUserInfo({...userInfo, password: e.target.value})} 
                  className="mb-3"
                  contrast={theme === 'dark-mode'}
                  type="password"
                />
                <MDBBtn color="warning" className="w-100" onClick={handleUserSignOut} disabled={loading || !userInfo.username || !userInfo.password}>
                   Apply Lockout
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </div>

          {/* Card 3: Close Ports */}
          <div className="col-md-6">
            <MDBCard className={`h-100 ${theme === 'light-mode' ? 'border border-dark' : 'border-0'}`} style={cardStyle}>
              <MDBCardBody>
                <MDBCardTitle className="d-flex align-items-center mb-3 text-success fw-bold">
                  <i className="fas fa-shield-alt me-2 fs-4"></i> Block Remote Ports
                </MDBCardTitle>
                <p className="small mb-4 text-muted">Create Windows Firewall rules to block inbound/outbound TCP and UDP connections on specific ports.</p>
                <MDBInput 
                  label="Ports (comma separated, e.g. 80, 443, 3389)" 
                  value={ports} 
                  onChange={(e) => setPorts(e.target.value)} 
                  className="mb-3"
                  contrast={theme === 'dark-mode'}
                />
                <MDBBtn color="success" className="w-100" onClick={handleClosePorts} disabled={loading || !ports}>
                   Block Ports
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </div>

          {/* Card 4: Custom Script */}
          <div className="col-md-6">
            <MDBCard className={`h-100 ${theme === 'light-mode' ? 'border border-dark' : 'border-0'}`} style={cardStyle}>
              <MDBCardBody>
                <MDBCardTitle className="d-flex align-items-center mb-3 text-info fw-bold">
                  <i className="fas fa-terminal me-2 fs-4"></i> Run Custom PowerShell
                </MDBCardTitle>
                <p className="small mb-4 text-muted">Execute a PowerShell script directly on {currentHost}.</p>
                <MDBTextArea 
                  label="Raw PowerShell Script Code" 
                  rows={4} 
                  value={customScript} 
                  onChange={(e) => setCustomScript(e.target.value)} 
                  className="mb-3"
                  contrast={theme === 'dark-mode'}
                />
                <MDBBtn color="info" className="w-100" onClick={handleCustomScript} disabled={loading || !customScript}>
                   <i className="fas fa-paper-plane me-2"></i>Send Custom Script
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Scripts;
