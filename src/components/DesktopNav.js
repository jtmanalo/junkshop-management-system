import React, { useState } from 'react';
import {
  Nav,
  InputGroup,
  Form,
  Button
} from 'react-bootstrap';

function DesktopNav() {
  const [isExpanded, setIsExpanded] = useState(true);

  const NavItem = ({ icon, text }) => (
    <Nav.Link
      href="#"
      className={`d-flex align-items-center rounded-3 p-2 my-1
        ${isExpanded ? 'px-3' : 'justify-content-center'}`}
      style={{
        transition: 'all 0.3s ease-in-out',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: '#fff',
      }}
    >
      <div className="me-2 d-flex align-items-center justify-content-center" style={{ width: '24px' }}>
        {icon}
      </div>
      <span className={isExpanded ? '' : 'd-none'}>
        {text}
      </span>
    </Nav.Link>
  );

  return (
    <div className="d-flex bg-white" style={{ minHeight: '100vh', width: '100vw' }}>
      <div
        className={`bg-dark text-white d-flex flex-column p-3 position-relative shadow-lg`}
        style={{
          width: isExpanded ? '250px' : '70px',
          transition: 'width 0.3s ease-in-out',
          height: '100vh',
          zIndex: 100
        }}
      >
        <div className="d-flex align-items-center mb-4">
            <Button
            variant="link"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-white ${isExpanded}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </Button>
          {/* <span className={`fs-5 fw-bold ${isExpanded ? '' : 'd-none'}`}>
          </span> */}
        </div>

        {/* Search bar (only visible when expanded) */}
        <div className={`mb-3 ${isExpanded ? '' : 'd-none'}`}>
          <InputGroup>
            <InputGroup.Text>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
            </InputGroup.Text>
            <Form.Control type="search" placeholder="Search..." />
          </InputGroup>
        </div>

        {/* Main navigation links */}
        <Nav className="flex-column flex-grow-1">
          <NavItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-grid"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>}
            text="Dashboard"
          />
          <NavItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
            text="User"
          />
          <NavItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8a8.5 8.5 0 0 1-7.6 4.7l-2.4 1.5a1 1 0 0 1-1.3-.8l-.5-3.3a8.5 8.5 0 0 1-4.7-7.6l1.5-2.4a1 1 0 0 1-.8-1.3l-3.3-.5a8.38 8.38 0 0 1 3.8-.9h.2a8.5 8.5 0 0 1 7.6 4.7l2.4 1.5a1 1 0 0 1 1.3.8l.5 3.3a8.38 8.38 0 0 1-.9 3.8z"></path></svg>}
            text="Messages"
          />
          <NavItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
            text="Analytics"
          />
          <NavItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-folder"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>}
            text="File Manager"
          />
          <NavItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-cart"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>}
            text="Order"
          />
          <NavItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>}
            text="Saved"
          />
          <NavItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-settings"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83l-2.83 2.83a2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33H9.1a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0L3.06 19.4a2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9.1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83L4.67 3.06a2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h1.82a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0l2.83 2.83a2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v1.82z"></path></svg>}
            text="Setting"
          />
        </Nav>

        {/* Bottom logout/expand button */}
        <Button
          variant="link"
        //   onClick={() => setIsExpanded(!isExpanded)}
          className="text-white mt-auto p-0"
        >
          <div className="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left-circle"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line></svg>
            <span className={`ms-3 ${isExpanded ? '' : 'd-none'}`}>
              Logout
            </span>
          </div>
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-grow-1 p-4">
        <h2>Home Content</h2>
      </div>
    </div>
  );
}

export default DesktopNav;
