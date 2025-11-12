const express = require('express');
const userController = require('./controllers');
const router = express.Router();

// Get all users
router.get('/users', userController.getAll);

// Create a user
router.post('/users', userController.create);

// Get user by ID
router.get('/users/:id', userController.getById);

// Update a user
router.put('/users/:id', userController.update);

// Delete a user
router.delete('/users/:id', userController.remove);

module.exports = router;