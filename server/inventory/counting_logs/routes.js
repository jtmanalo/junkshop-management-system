const express = require('express');
const countinglogController = require('./controllers');
const router = express.Router();

// Get all counting logs
router.get('/counting_logs', countinglogController.getAll);

// Create a counting log
router.post('/counting_logs', countinglogController.create);

// Get counting log by ID
router.get('/counting_logs/:id', countinglogController.getById);

// Update a counting log
router.put('/counting_logs/:id', countinglogController.update);

module.exports = router;