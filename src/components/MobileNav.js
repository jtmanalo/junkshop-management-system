import { useState } from 'react';
import { 
    Navbar, 
    Container, 
    Nav, 
    Offcanvas, 
    Button 
} from 'react-bootstrap';
const userProfilePic = "https://placehold.co/36x36/f0f0f0/343a40?text=JP";

function MobileNav() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Navbar bg="white" expand={false} className="shadow-sm">
        <Container fluid>
          <Button variant="link" onClick={handleShow} className="p-0 me-2 text-dark">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </Button>

          {/* Logo and title */}
          <Navbar.Brand href="#">
            {/* <img
              src="https://www.gstatic.com/images/branding/product/2x/google_classroom_48dp.png"
              width="24"
              height="24"
              className="d-inline-block align-top me-2"
              alt="Classroom logo"
            /> */}
            Junkshop Management System
          </Navbar.Brand>

          {/* Action buttons on the right */}
          <Nav className="ms-auto">
            <Button variant="link" className="text-dark">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </Button>
            <Button variant="link" className="p-0 ms-2 text-dark">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Offcanvas for the side navigation menu */}
      <Offcanvas show={show} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            Junkshop Management System
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Nav className="flex-column">
            {/* User profile section */}
            <div className="p-3 d-flex align-items-center border-bottom">
              <img src={userProfilePic} alt="User Profile" className="rounded-circle me-3" width="36" height="36" />
              <div className="d-flex flex-column">
                <span className="fw-bold">Jallen Rose Manalo</span>
                <span className="text-muted small">jtmanalo1@up.edu.ph</span>
              </div>
            </div>

            {/* Main menu items */}
            <Nav.Link href="#" className="py-2 px-3 text-dark">
              <span className="me-3"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span> Home
            </Nav.Link>
            <Nav.Link href="#" className="py-2 px-3 text-dark">
              <span className="me-3"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span> Calendar
            </Nav.Link>
            <Nav.Link href="#" className="py-2 px-3 text-dark">
              <span className="me-3">♊</span> Gemini
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default MobileNav;