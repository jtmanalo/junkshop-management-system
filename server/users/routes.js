const express = require('express');
const services = require('./services');
const router = express.Router();

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await services.getAllUsers(); // Call the service function
        if (users.length === 0) {
            return res.status(204).send("No users found");
        }
        res.json(users);
    } catch (error) {
        console.error('Error in GET /users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a user
router.post('/users', async (req, res) => {
    const { username, passwordHash, userType } = req.body;

    if (!username || !passwordHash || !userType) {
        return res.status(400).json({ error: 'Username, PasswordHash, and UserType are required.' });
    }

    try {
        const user = await services.createUser({ username, passwordHash, userType });
        res.status(201).json(user);
    } catch (error) {
        console.error('Error in POST /users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await services.getUserById(parseInt(req.params.id)); // Call the service function
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.json(user);
    } catch (error) {
        console.error('Error in GET /users/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update a user
router.put('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10);

    try {
        // Pass the request body directly to the service function
        const updatedUser = await services.updateUser(userId, req.body);
        res.json(updatedUser);
    } catch (error) {
        console.error('Error in PUT /users/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        await services.deleteUser(parseInt(req.params.id)); // Call the service function
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error in DELETE /users/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;