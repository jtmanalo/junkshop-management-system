const express = require('express');
const sellerController = require('./controllers');
const router = express.Router();

// Get all sellers
router.get('/sellers', sellerController.getAll);

// Create a seller
router.post('/sellers', sellerController.create);

// Get seller by ID
router.get('/sellers/:id', sellerController.getById);

// Update a seller
router.put('/sellers/:id', sellerController.update);

// Delete a seller
router.delete('/delete-seller/:id', sellerController.remove);

module.exports = router;