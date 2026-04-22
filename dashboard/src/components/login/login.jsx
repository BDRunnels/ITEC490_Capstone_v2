import React, { useState, useContext } from 'react';
import { HostContext } from '../../context/HostContext';
import { MDBBtn } from 'mdb-react-ui-kit';

const Login = () => {
  const { login } = useContext(HostContext);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(user, pass);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0e0e1a',
      fontFamily: 'inherit',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        borderRadius: '12px',
        backgroundColor: '#1e1e2f',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        textAlign: 'center',
        color: 'white',
      }}>
        {/* Logo / Branding */}
        <i className="fas fa-user-shield fa-3x mb-3" style={{ color: '#0d6efd' }}></i>
        <h2 style={{ fontWeight: 'bold', letterSpacing: '1px' }}>The Logfather</h2>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '30px' }}>
          SIEM Dashboard — Sign in to continue
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px', display: 'block' }}>Username</label>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#2b2b3c', border: '1px solid #4d4d5b', color: '#888' }}>
                <i className="fas fa-user"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
                autoFocus
                style={{
                  backgroundColor: '#2b2b3c',
                  border: '1px solid #4d4d5b',
                  color: 'white',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px', display: 'block' }}>Password</label>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#2b2b3c', border: '1px solid #4d4d5b', color: '#888' }}>
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                style={{
                  backgroundColor: '#2b2b3c',
                  border: '1px solid #4d4d5b',
                  color: 'white',
                }}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <MDBBtn
            type="submit"
            className="w-100 shadow"
            style={{ fontWeight: 'bold', letterSpacing: '0.5px', padding: '10px' }}
          >
            <i className="fas fa-sign-in-alt me-2"></i>Sign In
          </MDBBtn>
        </form>
      </div>
    </div>
  );
};

export default Login;
