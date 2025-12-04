const bcrypt = require('bcrypt');
const validator = require('validator');
const sanitize = require('sanitize-html');
const userService = require('./services');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const nodemailer = require('nodemailer'); // Import nodemailer

// Secret key for JWT (should be stored securely in environment variables)
const JWT_SECRET = process.env.JWT_SECRET;

async function approveReject(req, res) {
    const userId = parseInt(req.params.id, 10);
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected".' });
    }

    try {
        const updatedUser = await userService.approveReject(userId, status);

        // If approved, also update employee status to 'active'
        if (status === 'approved') {
            await userService.updateEmployeeStatus(userId, 'active');
        }

        res.json({ message: `User has been ${status} successfully`, user: updatedUser });
    } catch (error) {
        console.error('Error in approveRejectUser:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get all users
async function getAll(req, res) {
    try {
        const users = await userService.getAll();
        if (users.length === 0) {
            return res.status(204).send("No users found");
        }
        res.json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getUserDetails(req, res) {
    const { username } = req.params;

    try {
        const userDetails = await userService.getUserDetailsByUsername(username);
        if (!userDetails) {
            return res.status(404).send("User not found");
        }
        console.log('User Details:', userDetails);
        res.json(userDetails);
    } catch (error) {
        console.error('Error in getUserDetails:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a user+owner OR user+employee
async function register(req, res) {
    const { userType, ...data } = req.body;

    if (!data.name || !data.username || !data.email || !data.password || !userType) {
        return res.status(400).json({ error: 'Name, Username, Email, Password, and UserType are required.' });
    }

    // Validate email format
    if (!validator.isEmail(data.email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Validate user type
    const allowedUserTypes = ['owner', 'employee'];
    if (!allowedUserTypes.includes(userType)) {
        return res.status(400).json({ error: 'Invalid user type.' });
    }

    const users = await userService.getAll();
    // Check for duplicate username or email
    const existingUser = users.find((user) => user.email === data.email);
    const existingUsername = users.find((user) => user.username === data.username);
    if (existingUsername) {
        return res.status(409).json({ error: 'A user with this username already exists.' });
    }
    if (existingUser) {
        return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    try {
        // Sanitize inputs
        const sanitizedUsername = sanitize(data.username);
        const sanitizedEmail = sanitize(data.email);

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(data.password, saltRounds);

        // Determine status based on userType
        const status = userType === 'owner' ? 'approved' : 'pending';

        // Create the user
        const user = await userService.createUser({
            name: data.name,
            username: sanitizedUsername,
            email: sanitizedEmail,
            passwordHash,
            userType,
            status
        });

        if (userType === 'employee') {
            await userService.createEmployee({
                userId: user.id,
                positionTitle: data.positionTitle,
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                contactNumber: data.contactNumber,
                address: data.address,
                hireDate: data.hireDate,
                status: 'inactive'
            });

            return res.status(201).json({
                message: 'Registration successful. Your account is pending approval.',
                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    userType: user.userType,
                    status: user.status
                }
            });
        }
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ error: error.message });
    }
}

// login - Get user by email
async function login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await userService.getByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User does not exist.' });
        }

        // Check if the user's status is approved
        if (user.Status === 'pending') {
            return res.status(403).json({ error: 'Your account is not yet approved. Please wait for the owner to approve your account.' });
        } else if (user.Status === 'rejected') {
            res.status(200).json({ error: 'Your account is rejected. Please contact the owner.' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.UserID, email: user.Email }, JWT_SECRET, { expiresIn: '7d' });

        // Log the login activity
        await userService.createActivityLog({
            userId: user.UserID,
            activityType: 'login',
            description: `User ${user.Username} logged in.`,
        });

        res.json({ message: 'Login successful', token, userType: user.UserType, username: user.Username, defaultBranchID: user.BranchID, branchName: user.BranchName, branchLocation: user.BranchLocation, userID: user.UserID });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a user
async function update(req, res) {
    const userId = parseInt(req.params.id, 10);

    try {
        const updatedUser = await userService.update(userId, req.body);

        // Check if the status is being updated to 'approved'
        if (req.body.status === 'approved') {
            await userService.updateEmployeeStatus(userId, 'active');
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update user controller
async function updateUser(req, res) {
    console.log('PUT Request URL:', req.url);
    const userId = parseInt(req.params.id, 10);
    const {
        name,
        username,
        password,
        email,
        branchId,
        firstName,
        middleName,
        lastName,
        contactNumber,
        address,
        userType
    } = req.body;

    try {
        // Validate email
        if (email && !validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        // Hash password if provided
        let passwordHash;
        if (password) {
            const saltRounds = 10;
            passwordHash = await bcrypt.hash(password, saltRounds);
        }

        // Prepare data for update
        const updateData = {
            name: name,
            username: username,
            passwordHash,
            email: email,
            branchId: branchId,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            contactNumber: contactNumber,
            address: address,
            userType: userType // Include userType for employee updates
        };

        // Call the service to update the user
        const updatedUser = await userService.update(userId, updateData);

        await userService.createActivityLog({
            userId: userId,
            activityType: 'update',
            description: `User ${username} updated their profile.`,
        });

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getDetails(req, res) {
    const { username } = req.query;
    try {
        const userDetails = await userService.getUserAndEmployeeDetailsByUsername(username);
        res.json(userDetails);
    } catch (error) {
        console.error('Error in getDetails:', error);
        res.status(500).json({ error: error.message });
    }
}

// Delete a user
async function remove(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const result = await userService.remove(userId);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ error: error.message });
    }
}

// Middleware to validate JWT token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user; // Attach user info to request
        next();
    });
}

// Validate a token
async function validateToken(req, res) {
    const { token } = req.body; // Token sent in the request body

    if (!token) {
        return res.status(400).json({ valid: false, error: 'No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
        res.json({ valid: true, email: decoded.email }); // Respond with token validity and email
    } catch (error) {
        res.json({ valid: false, error: 'Invalid or expired token.' }); // Respond with invalid status
    }
}

// Forgot Password
async function forgotPassword(req, res) {
    const { email } = req.body;

    try {
        const user = await userService.getByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a password reset token
        const resetToken = jwt.sign({ id: user.UserID, email: user.Email }, JWT_SECRET, { expiresIn: '1h' });

        // Send email with reset link
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link below to reset your password:

http://localhost:3000/reset-password?token=${resetToken}

If you did not request this, please ignore this email.`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
}

async function logout(req, res) {
    const userId = req.params.userId;
    const { username } = req.body;

    try {
        // Log the logout activity
        await userService.createActivityLog({
            userId: userId,
            activityType: 'logout',
            description: `User ${username} logged out.`,
        });

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    register,
    login,
    update,
    remove,
    authenticateToken, // Middleware for protected routes
    validateToken, // Endpoint for token validation
    forgotPassword,
    getUserDetails,
    getDetails,
    updateUser,
    approveReject,
    logout
};