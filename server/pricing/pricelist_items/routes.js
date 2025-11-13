const express = require('express');
const pricelistitemController = require('./controllers');
const router = express.Router();

// Get all pricelist items
router.get('/pricelist-items', pricelistitemController.getAll);

// Create a pricelist item
router.post('/pricelist-items', pricelistitemController.create);

// Get pricelist item by ID
router.get('/pricelist-items/:id', pricelistitemController.getById);

// Update a pricelist item
router.put('/pricelist-items/:id', pricelistitemController.update);

// Delete a pricelist item
// router.delete('/pricelist-items/:id', pricelistitemController.remove);

module.exports = router;