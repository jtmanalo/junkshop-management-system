import React from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Button 
} from 'react-bootstrap';

function App() {
  return (
    <Container fluid className="p-0 d-flex flex-column min-vh-100">
      <Container fluid className="py-3 px-4" style={{ backgroundColor: '#e9ecef' }}>
        <Row className="d-flex align-items-center">
          <Col xs={6}>
            <p className="mb-0 fs-5 fw-bold">Remaining: ₱0.00</p>
            <p className="mb-0 fs-6">Starting: ₱0.00</p>
          </Col>
          <Col xs={6} className="text-end">
            <p className="mb-0 fw-bold fs-5">You are in:</p>
            <p className="mb-0 fs-6">Alaminos</p>
          </Col>
        </Row>
      </Container>
      
      <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="6rem"
            height="6rem"
            fill="currentColor"
            className="bi bi-clock"
            viewBox="0 0 16 16"
          >
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
          </svg>
        </div>
        <h2 className="mb-2">Shop is closed</h2>
        <p className="mb-4">Open shop to perform sales</p>
        <Button variant="dark" size="lg">Open Shop</Button>
      </Container>
      
    </Container>
  );
}

export default App;
