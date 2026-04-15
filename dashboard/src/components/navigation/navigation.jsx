import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HostContext } from '../../context/HostContext';
import {
  MDBNavbar,
  MDBContainer,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBCollapse,
  MDBBtn,
  MDBNavbarNav,
  MDBIcon,
  MDBInputGroup,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem
} from 'mdb-react-ui-kit';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentHost, username, logout } = useContext(HostContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
    logout();
  };
  
  const [hovered1, setHovered1] = useState(false);
  const [hovered2, setHovered2] = useState(false);
  const [hovered3, setHovered3] = useState(false);
  const [hovered4, setHovered4] = useState(false);
  const [hovered5, setHovered5] = useState(false);
  const [hovered6, setHovered6] = useState(false);
  const [hoveredSearch, setHoveredSearch] = useState(false);
  const [hoveredLogs, setHoveredLogs] = useState(false);

  // Button 1
  const handleHover1 = () => {
    setHovered1(!hovered1);
  };

   // Button 2
  const handleHover2 = () => {
    setHovered2(!hovered2);
  };

  // Button 3
  const handleHover3 = () => {
    setHovered3(!hovered3);
  };

  // Button 4
  const handleHover4 = () => {
    setHovered4(!hovered4);
  };

  // Button 5
  const handleHover5 = () => {
    setHovered5(!hovered5);
  };

  const handleHover6 = () => {
    setHovered6(!hovered6);
  };

  const handleHoverSearch = () => {
    setHoveredSearch(!hoveredSearch);
  };


  const buttonStyle1 = {
    backgroundColor: hovered1 ? 'white' : '',
    color: hovered1 ? 'black' : 'white',
    borderColor: hovered1 ? 'black' : 'white'
  };

  const buttonStyle2 = {
    backgroundColor: hovered2 ? 'white' : '',
    color: hovered2 ? 'black' : 'white',
    borderColor: hovered2 ? 'black' : 'white'
  };

  const buttonStyle3 = {
    backgroundColor: hovered3 ? 'white' : '',
    color: hovered3 ? 'black' : 'white',
    borderColor: hovered3 ? 'black' : 'white'
  };

  const buttonStyle4 = {
    backgroundColor: hovered4 ? 'white' : '',
    color: hovered4 ? 'black' : 'white',
    borderColor: hovered4 ? 'black' : 'white'
  };

  const buttonStyle5 = {
    backgroundColor: hovered5 ? 'white' : '',
    color: hovered5 ? 'black' : 'white',
    borderColor: hovered5 ? 'black' : 'white'
  };

  const buttonStyleSearch = {
    backgroundColor: hoveredSearch ? 'white' : '',
    color: hoveredSearch ? 'black' : 'white',
    borderColor: hoveredSearch ? 'black' : 'white'
  };

  const buttonStyle6 = {
    backgroundColor: hovered6 ? 'white' : '',
    color: hovered6 ? 'black' : 'white',
    borderColor: hovered6 ? 'black' : 'white'
  };

  return (
    <>
      <MDBNavbar scrolling expand='md' light bgColor='black' className='shadow navbar-dark fixed-top' 
      style={{
        'borderBottom': 'white 1px solid'
      }}
      onMouseLeave={() => setIsOpen(false)}>
        <MDBContainer fluid style={{ overflow: 'visible' }}>
          <MDBNavbarToggler
            type='button'
            data-target='#navbarCollapse'
            aria-controls='navbarCollapse'
            aria-expanded='false'
            aria-label='Toggle navigation'
            onClick={() => setIsOpen(!isOpen)}
          >
            { !isOpen ? (<MDBIcon icon='bars' fas  />) : (<MDBIcon fas icon="angle-double-down" />)}
          </MDBNavbarToggler>
          <Link to='/' className='nav-link' onClick={() => setIsOpen(false)} > <img style={{ borderRadius: '5px', border: '3px solid white', height: '50px', width: '125px' }} src='https://www.comodo.com/images/what-are-the-three-characteristics-of-siem.png' alt='Banner' /> </Link>
          <MDBCollapse navbar id='navbarCollapse' show={isOpen} >
            <MDBNavbarNav className='mr-auto mb-2 mb-lg-0 justify-content-end '>
              {/* Display Active Selected PC/Host with Dropdown */}
            {currentHost && (
              <MDBDropdown className="ms-lg-4 mt-3 mt-lg-0">
                <MDBDropdownToggle tag="div" className="d-flex align-items-center justify-content-center p-2 rounded w-100 h-100 border border-white" style={{ backgroundColor: "#2b2b3c", cursor: "pointer", boxShadow: "none" }}>
                  <i className="fas fa-desktop text-info me-2"></i>
                  <div className="d-flex flex-column lh-1 me-2 text-center">
                    <span className="text-white border-white" style={{ fontSize: "0.7rem", fontWeight: "bold", textTransform: "uppercase" }}>Selected VM</span>
                    <span className="text-white fw-bold" style={{ fontSize: "0.9rem" }}>{currentHost}</span>
                  </div>
                </MDBDropdownToggle>
                <MDBDropdownMenu style={{ backgroundColor: "#2b2b3c", border: "1px solid #4d4d5b", position: "absolute", zIndex: 1050, minWidth: "100%", padding: 0 }}>
                  <MDBDropdownItem link style={{ backgroundColor: hoveredLogs ? "white" : "transparent", padding: 0 }}>
                    <Link 
                      to="/logs" 
                      className={`text-decoration-none d-block w-100 text-center py-2 ${hoveredLogs ? 'text-black' : 'text-white'}`} 
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => setHoveredLogs(true)}
                      onMouseLeave={() => setHoveredLogs(false)}
                      style={{ transition: "color 0.2s ease-in-out" }}
                    >
                      <i className="fas fa-list me-2"></i> View Logs
                    </Link>
                  </MDBDropdownItem>
                </MDBDropdownMenu>
              </MDBDropdown>
            )}
              <MDBNavbarItem>
                {/* <MDBNavbarLink active aria-current='page' href='/species'> */}
                <Link to='/computers' className='nav-link' onClick={() => setIsOpen(false)} >
                    <MDBBtn  outline color='white' onMouseEnter={handleHover1} onMouseLeave={handleHover1} style={buttonStyle1} type='button'>
                        COMPUTERS
                    </MDBBtn>
                {/* </MDBNavbarLink> */}
                </Link>
              </MDBNavbarItem>
              <MDBNavbarItem>
                {/* <MDBNavbarLink active aria-current='page' href='/starships'> */}
                <Link to='/scripts' className='nav-link' onClick={() => setIsOpen(false)}>
                    <MDBBtn  outline color='white' onMouseEnter={handleHover4} onMouseLeave={handleHover4} style={buttonStyle4} type='button'>
                        SCRIPTS
                    </MDBBtn>
                </Link>
                {/* </MDBNavbarLink> */}
              </MDBNavbarItem>
              <MDBNavbarItem>
                {/* <MDBNavbarLink active aria-current='page' href='/vehicles'> */}
                <Link to='/CVE' className='nav-link' onClick={() => setIsOpen(false)}>
                    <MDBBtn  outline color='white' onMouseEnter={handleHover3} onMouseLeave={handleHover3} style={buttonStyle3} type='button'>
                        CVE
                    </MDBBtn>
                {/* </MDBNavbarLink> */}
                </Link>
              </MDBNavbarItem>
              <MDBNavbarItem>
                {/* <MDBNavbarLink active aria-current='page' href='/search'> */}
                <Link to='/search' className='nav-link' onClick={() => setIsOpen(false)}>
                    <MDBBtn  outline color='white' onMouseEnter={handleHoverSearch} onMouseLeave={handleHoverSearch} style={buttonStyleSearch} type='button'>
                        <i className="fas fa-search me-2"></i>SEARCH
                    </MDBBtn>
                </Link>
                {/* </MDBNavbarLink> */}
              </MDBNavbarItem>
              <MDBNavbarItem>
                <Link to='/admin' className='nav-link' onClick={() => setIsOpen(false)}>
                    <MDBBtn outline color='white' onMouseEnter={handleHover2} onMouseLeave={handleHover2} style={buttonStyle2} type='button'>
                        <i className="fas fa-lock me-2"></i>ADMIN
                    </MDBBtn>
                </Link>
              </MDBNavbarItem>
              <MDBNavbarItem>
                {/* <MDBNavbarLink active aria-current='page' href='/starships'> */}
                <Link to='/about' className='nav-link visually-hidden' onClick={() => setIsOpen(false)}>
                    <MDBBtn  outline color='white' onMouseEnter={handleHover5} onMouseLeave={handleHover5} style={buttonStyle5} type='button'>
                        ABOUT
                    </MDBBtn>
                </Link>
                {/* </MDBNavbarLink> */}
              </MDBNavbarItem>
              <MDBNavbarItem>
                <span className='nav-link'>
                    <MDBBtn outline color='white' onMouseEnter={handleHover6} onMouseLeave={handleHover6} style={buttonStyle6} onClick={handleLogout} type='button'>
                        <i className="fas fa-sign-out-alt me-2"></i>Sign Out
                    </MDBBtn>
                </span>
              </MDBNavbarItem>
            </MDBNavbarNav>
          </MDBCollapse>
        </MDBContainer>
      </MDBNavbar>
    </>
  );
}

export default Navigation;