import { useState } from 'react';
import {
    Container,
    Nav,
    Tab,
    Form,
    Button,
    Card,
    Modal,
    Alert
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

function LoginPage() {
    const [activeTab, setActiveTab] = useState('login');

    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        userType: 'owner' // Default user type
    });

    const auth = useAuth();

    const [showModal, setShowModal] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // Validate email
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        return newErrors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Clear errors for the field being updated
        setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        console.log('Login attempted with:', { email: formData.email, password: formData.password });
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        } else {
            setErrors({});
            try {
                if (formData.email !== "" && formData.password !== "") {
                    auth.loginAction(formData);
                    return;
                }
                console.log("email:", formData.email);
                console.log("password:", formData.password);
                console.log("Please fill in all fields.");
                alert("Please fill in all fields.");

            } catch (error) {
                if (error.response && error.response.status === 401) {
                    setErrors({ general: 'Invalid email or password. Please try again.' });
                } else {
                    console.error('Error during login:', error);
                    setErrors({ general: 'An error occurred. Please try again later.' });
                }
            }
        };
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/sign-up`, formData);
            if (response.status === 201 && response.data) {
                console.log('Registration successful:', response.data);

                if (formData.userType === 'owner') {
                    // setShowModal(true); // Show success modal for owners
                    alert('Your account has been created successfully!')
                } else {
                    alert('Registration successful. Your account is pending approval.'); // Alert for employees
                }

                // Reset the form fields to their default empty state
                setFormData({
                    name: '',
                    username: '',
                    email: '',
                    password: '',
                    userType: 'owner' // Default user type
                });
            } else {
                console.error('Registration failed:', response.data?.error || 'Unknown error');
                setErrors({ general: response.data?.error || 'Registration failed. Please try again.' });
            }
        } catch (error) {
            if (error.response && error.response.status === 500) {
                // Handle duplicate entry error
                if (error.response.data.error.includes('Duplicate entry')) {
                    setErrors({ general: 'The email or username is already in use. Please try another.' });
                } else {
                    setErrors({ general: 'An internal server error occurred. Please try again later.' });
                }
            } else {
                console.error('Error during registration:', error);
                setErrors({ general: 'An error occurred. Please try again later.' });
            }
        }
    };

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
                                {/* Ensure errors are properly rendered */}
                                {errors.general && <Alert variant="danger">{errors.general}</Alert>}
                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-4">
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={formData.email} // Use formData.email
                                            onChange={handleInputChange} // Update formData directly
                                            isInvalid={!!errors.email} />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            value={formData.password} // Use formData.password
                                            onChange={handleInputChange} // Update formData directly
                                            isInvalid={!!errors.password}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.password}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Button className="mb-4 w-100" type="submit">Sign in</Button>
                                    <p className="text-center">Not a member? <Nav.Link onClick={() => setActiveTab('register')} className="d-inline-block p-0" style={{ color: 'blue', textDecoration: 'underline' }}>Register</Nav.Link></p>
                                </Form>
                            </Tab.Pane>

                            <Tab.Pane eventKey="register">
                                <Form onSubmit={handleRegister}>
                                    <Form.Group className="mb-4">
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            placeholder="Name"
                                            value={formData.name}
                                            onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            value={formData.username}
                                            onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-4 text-center"> {/* Centered the user type */}
                                        <Form.Label className="mb-3">Sign up as:</Form.Label> {/* Added margin-bottom to create space */}
                                        <div className="d-inline-block"> {/* Ensures the checks are inline and centered */}
                                            <Form.Check
                                                inline
                                                label="Owner"
                                                name="userType"
                                                type="radio"
                                                value="owner"
                                                checked={formData.userType === 'owner'}
                                                onChange={handleInputChange}
                                            />
                                            <Form.Check
                                                inline
                                                label="Employee"
                                                name="userType"
                                                type="radio"
                                                value="employee"
                                                checked={formData.userType === 'employee'}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </Form.Group>
                                    <Button className="mb-4 w-100" type="submit">Sign up</Button>
                                    <p className="text-center">Already a member? <Nav.Link onClick={() => setActiveTab('login')} className="d-inline-block p-0" style={{ color: 'blue', textDecoration: 'underline' }}>Login</Nav.Link></p>
                                </Form>
                            </Tab.Pane>
                        </Tab.Content>
                    </Card.Body>
                </Tab.Container>
            </Card>

            {/* Success Modal */}
            {/* <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Registration Successful</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your account has been created successfully!
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal> */}

            {/* Forgot Password Modal */}
            {/* <Modal show={showForgotPasswordModal} onHide={() => setShowForgotPasswordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleForgotPassword}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Send Reset Link
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal> */}
        </Container>
    );
}

export default LoginPage;
