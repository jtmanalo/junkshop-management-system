const express = require('express');
const buyerController = require('./controllers');
const router = express.Router();

// Get all buyers
router.get('/buyers', buyerController.getAll);

// Get buyers list (ID and CompanyName only)
router.get('/buyers-list', buyerController.getList);

// Create a buyer
router.post('/buyers', buyerController.create);

// Get buyer by ID
router.get('/buyers/:id', buyerController.getById);

// Update a buyer
router.put('/buyers/:id', buyerController.update);

module.exports = router;