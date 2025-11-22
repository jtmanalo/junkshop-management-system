const express = require('express');
const userController = require('./controllers');
const router = express.Router();

// Create a user
router.post('/sign-up', userController.register);

router.post('/validate-token', userController.validateToken);

// Login
router.post('/login', userController.login);

// Get all users
// router.get('/users', userController.authenticateToken, userController.getAll);

// Get user by username
router.get('/users/:username', userController.getUserDetails);

// Update a user
router.put('/users/:id', userController.authenticateToken, userController.update);

router.get('/protected-route', userController.authenticateToken, (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
});

module.exports = router;