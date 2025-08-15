import {
    Row,
    Col,
    Container
} from 'react-bootstrap';

const Header = () => {
    return (
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
    );
};

export default Header;
