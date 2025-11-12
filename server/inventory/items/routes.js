const express = require('express');
const itemController = require('./controllers');
const router = express.Router();

// Get all items
router.get('/items', itemController.getAll);

// Create an item
router.post('/items', itemController.create);

// Get item by ID
router.get('/items/:id', itemController.getById);

// Update an item
router.put('/items/:id', itemController.update);

module.exports = router;