const express = require('express');
const userController = require('./controllers');
const router = express.Router();

// Create a user (User+Owner and User+Employee)
router.post('/sign-up', userController.register);

router.post('/validate-token', userController.validateToken);

// Login
router.post('/login', userController.login);

router.post('/logout/:userId', userController.logout);

// Get all users
router.get('/users', userController.getAll);

router.put('/users/:id/approve-reject', userController.approveReject);

// Get user by username
router.get('/users/:username', userController.getUserDetails);

// Get user details
router.get('/user-details', userController.getDetails);

// Update a user
router.put('/users/:id', userController.update);

router.put('/users-update/:id', userController.updateUser);

router.get('/activity-logs', userController.getActivityLogs);

router.get('/protected-route', userController.authenticateToken, (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
});

module.exports = router;