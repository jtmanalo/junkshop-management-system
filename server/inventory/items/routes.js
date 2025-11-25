const express = require('express');
const itemController = require('./controllers');
const router = express.Router();

// Get all items of a branch with pricing
router.get('/items', itemController.getAllItemsWithPricing);

// Create an item
router.post('/items', itemController.create);

// Get item by ID
router.get('/items/:id', itemController.getById);

// Update an item
router.put('/items/:id', itemController.update);

module.exports = router;