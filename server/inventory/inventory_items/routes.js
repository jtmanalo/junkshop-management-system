const express = require('express');
const inventoryitemController = require('./controllers');
const router = express.Router();

// Get all inventory items
router.get('/inventory-items', inventoryitemController.getAll);

// Create an inventory item
router.post('/inventory-items', inventoryitemController.create);

// Get inventory item by ID
router.get('/inventory-items/:id', inventoryitemController.getById);

// Update an inventory item
router.put('/inventory-items/:id', inventoryitemController.update);

// Delete an inventory item
// router.delete('/inventory-items/:id', inventoryitemController.remove);

module.exports = router;