const express = require('express');
const transactionitemController = require('./controllers');
const router = express.Router();

// Get all transaction items
router.get('/transaction-items', transactionitemController.getAll);

// Create a transaction item
router.post('/transaction-items', transactionitemController.create);

// Get transaction item by ID
router.get('/transaction-items/:id', transactionitemController.getById);

// Update a transaction item
router.put('/transaction-items/:id', transactionitemController.update);

module.exports = router;