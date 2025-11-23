import { useState, useEffect } from 'react';
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
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons

function LoginPage() {
    const [activeTab, setActiveTab] = useState('login');

    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        userType: 'owner', // Default user type
        positionTitle: '',
        firstName: '',
        middleName: '',
        lastName: '',
        contactNumber: '',
        address: '',
        hireDate: ''
    });

    const auth = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

    useEffect(() => {
        // Set the hire date to the current date
        const today = new Date().toISOString().split('T')[0];
        setFormData((prevData) => ({ ...prevData, hireDate: today }));
    }, []);

    // Add debugging logs to validateLoginForm to check if password validation is triggered
    const validateLoginForm = () => {
        const newErrors = {};

        // Validate email
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Validate password
        if (!formData.password) {
            console.log('Password validation triggered: Password is empty'); // Debugging log
            newErrors.password = 'Password is required';
            console.log('Password error set: ', newErrors.password); // Debugging log
        } else {
            console.log('Password validation passed: ', formData.password); // Debugging log
        }

        return newErrors;
    };

    // Update validateRegisterForm to ensure errors are properly set for both employee and owner
    const validateRegisterForm = () => {
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

        // Validate contact number
        if (!formData.contactNumber) {
            newErrors.contactNumber = 'Contact number is required';
        } else if (!/^\d{1,11}$/.test(formData.contactNumber)) {
            newErrors.contactNumber = 'Contact number must be up to 11 digits';
        }

        // Validate username
        if (!formData.username) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 4) {
            newErrors.username = 'Username must be at least 4 characters';
        }

        // Validate fields specific to employee
        if (formData.userType === 'employee') {
            if (!formData.firstName) {
                newErrors.firstName = 'First name is required';
            }
            if (!formData.lastName) {
                newErrors.lastName = 'Last name is required';
            }
            if (!formData.positionTitle) {
                newErrors.positionTitle = 'Position title is required';
            }
            if (!formData.address) {
                newErrors.address = 'Complete address is required';
            }
        }

        // Validate fields specific to owner
        if (formData.userType === 'owner' && !formData.name) {
            newErrors.name = 'Name is required';
        }

        console.log('Validation errors:', newErrors); // Debugging log
        return newErrors;
    };

    const renderFieldError = (fieldName) => {
        return errors[fieldName] ? 'is-invalid' : '';
    };

    const toPascalCase = (str) => {
        return str.replace(/\w+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Clear errors for the field being updated
        setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

        setFormData({ ...formData, [name]: value });
    };

    // Add debugging logs to handleLogin to check errors state
    const handleLogin = (e) => {
        e.preventDefault();
        const formErrors = validateLoginForm();
        console.log("Form errors before setting state:", formErrors); // Debugging log
        console.log("password:", errors.password); // Debugging log

        setErrors(formErrors);

        // Log the updated errors state after setting it
        setTimeout(() => {
            console.log("Errors state after update:", errors); // Debugging log
        }, 0);

        if (Object.keys(formErrors).length > 0) {
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
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const formErrors = validateRegisterForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            // Convert fields to Pascal Case
            const formattedData = {
                ...formData,
                firstName: toPascalCase(formData.firstName),
                lastName: toPascalCase(formData.lastName),
                positionTitle: toPascalCase(formData.positionTitle),
                address: toPascalCase(formData.address),
            };

            // Combine first name and last name as Name if userType is employee
            const name = formattedData.userType === 'employee'
                ? `${formattedData.firstName} ${formattedData.lastName}`
                : formattedData.name;

            // Create user data
            const userPayload = {
                name: name, // Use combined name for employees
                username: formattedData.username,
                userType: formattedData.userType,
                email: formattedData.email,
                password: formattedData.password, // Ensure password is included
                status: formattedData.userType === 'owner' ? 'approved' : 'pending' // Default status based on userType
            };

            const userResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/sign-up`, userPayload);
            if (userResponse.status === 201 && userResponse.data) {
                console.log('User registration successful:', userResponse.data);
                console.log('User ID:', userResponse.data.user.id);

                if (formattedData.userType === 'employee') {
                    // Create employee data
                    const employeePayload = {
                        userId: userResponse.data.user.id, // Use the returned user ID
                        positionTitle: formattedData.positionTitle,
                        firstName: formattedData.firstName,
                        middleName: formattedData.middleName,
                        lastName: formattedData.lastName,
                        contactNumber: formattedData.contactNumber,
                        address: formattedData.address,
                        hireDate: formattedData.hireDate,
                        status: 'inactive' // Default status for employees
                    };

                    try {
                        const employeeResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/employees`, employeePayload);

                        if (employeeResponse.status === 201) {
                            alert('Registration successful. Your account is pending approval, and an employee record has been created.');
                        } else {
                            console.error('Failed to create employee record:', employeeResponse.data);
                            setErrors({ general: 'Employee record creation failed. Please contact support.' });
                        }
                    } catch (employeeError) {
                        console.error('Error creating employee record:', employeeError);
                        setErrors({ general: 'An error occurred while creating the employee record. Please try again later.' });
                    }
                } else {
                    alert('Your account has been created successfully!');
                }

                // Reset the form fields to their default empty state
                setFormData({
                    username: '',
                    userType: 'owner', // Default user type
                    email: '',
                    positionTitle: '',
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    contactNumber: '',
                    address: '',
                    hireDate: '',
                    password: ''
                });
            } else {
                console.error('User registration failed:', userResponse.data?.error || 'Unknown error');
                setErrors({ general: userResponse.data?.error || 'Registration failed. Please try again.' });
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

    // Reset errors and showPassword state when switching tabs or user types
    useEffect(() => {
        // Reset errors and showPassword state when switching tabs or user types
        setErrors({});
        setShowPassword(false);
    }, [activeTab, formData.userType]);

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
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <div className="input-group">
                                            <Form.Control
                                                type={showPassword ? "text" : "password"} // Toggle between text and password
                                                name="password"
                                                id="password"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.password}
                                                style={{ borderRight: 'none' }} // Remove right border to blend with the icon
                                            />
                                            <div className="input-group-append">
                                                <span
                                                    className="input-group-text"
                                                    style={{
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        borderLeft: 'none', // Remove left border to blend with the input field
                                                        border: '1px solid #ced4da', // Match the border style of the input field
                                                        borderTopRightRadius: '0.25rem',
                                                        borderBottomRightRadius: '0.25rem'
                                                    }}
                                                    onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                                                >
                                                    {showPassword ? <FaEye /> : <FaEyeSlash />} {/* Show appropriate icon */}
                                                </span>
                                            </div>
                                        </div>

                                    </Form.Group>

                                    <Button className="mb-4 w-100" type="submit">Sign in</Button>
                                    <p className="text-center">Not a member? <Nav.Link onClick={() => setActiveTab('register')} className="d-inline-block p-0" style={{ color: 'blue', textDecoration: 'underline' }}>Register</Nav.Link></p>
                                </Form>
                            </Tab.Pane>

                            <Tab.Pane eventKey="register">
                                <Form onSubmit={handleRegister}>
                                    {formData.userType !== 'employee' && (
                                        <Form.Group className="mb-4">
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                placeholder="Name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.name}
                                            />
                                        </Form.Group>
                                    )}
                                    {formData.userType === 'employee' && (
                                        <Form.Group className="mb-4 d-flex justify-content-between">
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                placeholder="First Name"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                style={{ height: '2.5rem', marginRight: '0.5rem' }} // Added marginRight for spacing
                                                isInvalid={!!errors.firstName}
                                            />
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                placeholder="Last Name"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                style={{ height: '2.5rem', marginLeft: '0.5rem' }} // Added marginLeft for spacing
                                                isInvalid={!!errors.lastName}
                                            />
                                        </Form.Group>
                                    )}
                                    <Form.Group className="mb-4">
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className={renderFieldError('username')}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={renderFieldError('email')}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <div className="input-group">
                                            <Form.Control
                                                type={showPassword ? "text" : "password"} // Toggle between text and password
                                                name="password"
                                                id="password"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={renderFieldError('password')}
                                                style={{ borderRight: 'none' }} // Remove right border to blend with the icon
                                            />
                                            <div className="input-group-append">
                                                <span
                                                    className="input-group-text"
                                                    style={{
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        borderLeft: 'none', // Remove left border to blend with the input field
                                                        border: '1px solid #ced4da', // Match the border style of the input field
                                                        borderTopRightRadius: '0.25rem',
                                                        borderBottomRightRadius: '0.25rem'
                                                    }}
                                                    onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                                                >
                                                    {showPassword ? <FaEye /> : <FaEyeSlash />} {/* Show appropriate icon */}
                                                </span>
                                            </div>
                                        </div>
                                    </Form.Group>
                                    {formData.userType === 'employee' && (
                                        <>
                                            <Form.Group className="mb-4 d-flex justify-content-between">
                                                <Form.Control
                                                    type="text"
                                                    name="positionTitle"
                                                    placeholder="Position Title"
                                                    value={formData.positionTitle}
                                                    onChange={handleInputChange}
                                                    style={{ height: '2.5rem', marginRight: '0.5rem' }} // Added marginRight for spacing
                                                    isInvalid={!!errors.positionTitle}
                                                />
                                                <Form.Control
                                                    type="text"
                                                    name="contactNumber"
                                                    placeholder="Contact Number"
                                                    value={formData.contactNumber}
                                                    onChange={handleInputChange}
                                                    style={{ height: '2.5rem', marginLeft: '0.5rem' }} // Added marginLeft for spacing
                                                    isInvalid={!!errors.contactNumber}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-4 d-flex">
                                                <Form.Control
                                                    type="text"
                                                    name="address"
                                                    placeholder="Complete Address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.address}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-4 d-flex align-items-center justify-content-center"> {/* Center alignment */}
                                                <Form.Label htmlFor="hireDate" className="small me-2 text-center" style={{ whiteSpace: 'nowrap', fontSize: '0.975rem' }}>Date Hired:</Form.Label> {/* Centered label */}
                                                <Form.Control
                                                    type="date"
                                                    name="hireDate"
                                                    id="hireDate"
                                                    placeholder="Hire Date"
                                                    value={formData.hireDate}
                                                    onChange={handleInputChange}
                                                    className="flex-grow-1"
                                                />
                                            </Form.Group>
                                        </>
                                    )}
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
