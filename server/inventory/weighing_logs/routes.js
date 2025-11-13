const express = require('express');
const weighinglogController = require('./controllers');
const router = express.Router();

// Get all weighing logs
router.get('/weighing_logs', weighinglogController.getAll);

// Create a weighing log
router.post('/weighing_logs', weighinglogController.create);

// Get weighing log by ID
router.get('/weighing_logs/:id', weighinglogController.getById);

// Update a weighing log
router.put('/weighing_logs/:id', weighinglogController.update);

module.exports = router;