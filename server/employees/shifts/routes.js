const express = require('express');
const shiftController = require('./controllers');
const router = express.Router();

// Get all shifts
router.get('/shifts', shiftController.getAll);

// Create a shift
router.post('/shifts', shiftController.create);

// Get shift by ID
router.get('/shifts/:id', shiftController.getById);

// Get shift by UserID
router.get('/shifts/user/:userId', shiftController.getByUserId);

// Update a shift
router.put('/shifts/:id', shiftController.update);

module.exports = router;