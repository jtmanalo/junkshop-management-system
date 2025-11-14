const express = require('express');
const pricelistactivityController = require('./controllers');
const router = express.Router();

// Get all pricelist activities
router.get('/pricelist_activities', pricelistactivityController.getAll);

// Create a pricelist activity
router.post('/pricelist_activities', pricelistactivityController.create);

// Get pricelist activity by ID
router.get('/pricelist_activities/:id', pricelistactivityController.getById);

// Update a pricelist activity
router.put('/pricelist_activities/:id', pricelistactivityController.update);

// Delete a pricelist activity
// router.delete('/pricelist_activities/:id', pricelistactivityController.remove);

module.exports = router;