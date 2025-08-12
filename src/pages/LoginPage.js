import { React, useState } from 'react';
// import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';
import { Container, Row, Col, Button, Form, Image } from 'react-bootstrap';


function LoginPage() {
    const [activeTab, setActiveTab] = useState('login');

  return (
    // <Form>
    //   <Form.Group className="mb-3" controlId="formBasicEmail">
    //     <Form.Label>Email address</Form.Label>
    //     <Form.Control type="email" placeholder="Enter email" />
    //     <Form.Text className="text-muted">
    //       We'll never share your email with anyone else.
    //     </Form.Text>
    //   </Form.Group>

    //   <Form.Group className="mb-3" controlId="formBasicPassword">
    //     <Form.Label>Password</Form.Label>
    //     <Form.Control type="password" placeholder="Password" />
    //   </Form.Group>
    //   <Form.Group className="mb-3" controlId="formBasicCheckbox">
    //     <Form.Check type="checkbox" label="Check me out" />
    //   </Form.Group>
    //   <Button variant="primary" type="submit">
    //     Submit
    //   </Button>
    // </Form>
    <Container fluid className="p-3 my-5 h-custom">
      <Row>
        <Col col="10" md="6">
          <Image
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            className="img-fluid"
            alt="Sample image"
          />
        </Col>

        <Col col="4" md="6">
          <div className="d-flex flex-row align-items-center justify-content-center">
            <p className="lead fw-normal mb-0 me-3">Sign in with</p>
            <Button variant="primary" size="md" className="me-2">
              {/* <FontAwesomeIcon icon={faFacebookF} /> */}
              <a>FB</a>
            </Button>
            <Button variant="primary" size="md" className="me-2">
              {/* <FontAwesomeIcon icon={faTwitter} /> */}
              <a>Twitter</a>
            </Button>
            <Button variant="primary" size="md" className="me-2">
              {/* <FontAwesomeIcon icon={faLinkedinIn} /> */}
              <a>LinkedIn</a>
            </Button>
          </div>

          <div className="divider d-flex align-items-center my-4">
            <p className="text-center fw-bold mx-3 mb-0">Or</p>
          </div>

          <Form.Control
            size="lg"
            className="mb-4"
            type="email"
            placeholder="Email address"
          />
          <Form.Control
            size="lg"
            className="mb-4"
            type="password"
            placeholder="Password"
          />

          <div className="d-flex justify-content-between mb-4">
            <Form.Check type="checkbox" label="Remember me" />
            <a href="#!">Forgot password?</a>
          </div>

          <div className="text-center text-md-start mt-4 pt-2">
            <Button variant="primary" className="mb-0 px-5" size="lg">
              Login
            </Button>
            <p className="small fw-bold mt-2 pt-1 mb-2">
              Don't have an account? <a href="#!" className="link-danger">Register</a>
            </p>
          </div>
        </Col>
      </Row>

      <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
        <div className="text-white mb-3 mb-md-0">
          Copyright © 2020. All rights reserved.
        </div>

        <div>
          <Button variant="link" className="mx-3" style={{ color: 'white' }}>
            {/* <FontAwesomeIcon icon={faFacebookF} size="md" /> */}
            <a>FB</a>
          </Button>
          <Button variant="link" className="mx-3" style={{ color: 'white' }}>
            {/* <FontAwesomeIcon icon={faTwitter} size="md" /> */}
            <a>Twitter</a>
          </Button>
          <Button variant="link" className="mx-3" style={{ color: 'white' }}>
            {/* <FontAwesomeIcon icon={faGoogle} size="md" /> */}
            <a>Google</a>
          </Button>
          <Button variant="link" className="mx-3" style={{ color: 'white' }}>
            {/* <FontAwesomeIcon icon={faLinkedinIn} size="md" /> */}
            <a>LinkedIn</a>
          </Button>
        </div>
      </div>
    </Container>
  );
}
export default LoginPage;