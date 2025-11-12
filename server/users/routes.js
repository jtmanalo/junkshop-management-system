const express = require('express');
const userController = require('./controllers');
const router = express.Router();

// Get all users
router.get('/users', userController.getAllUsers);

// Create a user
router.post('/users', userController.createUser);

// Get user by ID
router.get('/users/:id', userController.getUserById);

// Update a user
router.put('/users/:id', userController.updateUser);

// Delete a user
router.delete('/users/:id', userController.deleteUser);

module.exports = router;