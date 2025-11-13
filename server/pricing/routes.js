const express = require('express');
const pricelistController = require('./controllers');
const router = express.Router();

// Get all pricelists
router.get('/pricelists', pricelistController.getAll);

// Create a pricelist
router.post('/pricelists', pricelistController.create);

// Get pricelist by ID
router.get('/pricelists/:id', pricelistController.getById);

// Update a pricelist
router.put('/pricelists/:id', pricelistController.update);

// Delete a pricelist
// router.delete('/pricelists/:id', pricelistController.remove);

module.exports = router;