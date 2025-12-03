const express = require('express');
const inventoryController = require('./controllers');
const router = express.Router();

// Get all inventory items
router.get('/inventory', inventoryController.getAll);

router.get('/branch-inventory', inventoryController.getBranchInventory);

// Create an inventory item
router.post('/inventory', inventoryController.create);

// Get inventory item by ID
router.get('/inventory/:id', inventoryController.getById);

// Update an inventory item
router.put('/inventory/:id', inventoryController.update);

module.exports = router;