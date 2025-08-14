import { useState } from 'react';
import {
    Container,
    Nav,
    Tab,
    Form,
    Button,
    Card
} from 'react-bootstrap';

function LoginPage() {

    const [activeTab, setActiveTab] = useState('login');

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
            <Card className="w-100" style={{ maxWidth: '450px' }}>
            <Tab.Container activeKey={activeTab} onSelect={(key) => setActiveTab(key)}>
                <Nav variant="pills" justify className='mb-3'>
                <Nav.Item>
                    <Nav.Link eventKey="login">Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="register">Register</Nav.Link>
                </Nav.Item>
                </Nav>

            <Card.Body>
                <Tab.Content>
                    <Tab.Pane eventKey="login">
                        <Form>
                        <Form.Group className="mb-4">
                            <Form.Control type="email" placeholder="Email address" />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Control type="password" placeholder="Password" />
                        </Form.Group>

                        <div className="d-flex justify-content-between mx-9 mb-4">
                            <Form.Check type="checkbox" label="Remember me" />
                            <a href="#!">Forgot password?</a>
                        </div>

                        <Button className="mb-4 w-100">Sign in</Button>
                        <p className="text-center">Not a member? <Nav.Link onClick={() => setActiveTab('register')} className="d-inline-block p-0" style={{ color: 'blue', textDecoration: 'underline' }}>Register</Nav.Link></p>
                        </Form>
                    </Tab.Pane>

                    <Tab.Pane eventKey="register">
                        <Form>
                            <Form.Group className="mb-4">
                                <Form.Control type="text" placeholder="Name" />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Control type="text" placeholder="Username" />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Control type="email" placeholder="Email" />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Control type="password" placeholder="Password" />
                            </Form.Group>
                            <Button className="mb-4 w-100">Sign up</Button>
                            <p className="text-center">Already a member? <Nav.Link onClick={() => setActiveTab('login')} className="d-inline-block p-0" style={{ color: 'blue', textDecoration: 'underline' }}>Login</Nav.Link></p>
                        </Form>
                    </Tab.Pane>
                </Tab.Content>
            </Card.Body>
            </Tab.Container>
            </Card>
        </Container>
    );
}

export default LoginPage;
