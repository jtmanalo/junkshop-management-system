const express = require('express');
const transactionController = require('./controllers');
const router = express.Router();

// Get all transactions
router.get('/transactions', transactionController.getAll);

// Create a transaction
router.post('/transactions', transactionController.create);

// Get transaction by ID
router.get('/transactions/:id', transactionController.getById);

// Update a transaction
router.put('/transactions/:id', transactionController.update);

// Delete a transaction
// router.delete('/transactions/:id', transactionController.remove);

module.exports = router;