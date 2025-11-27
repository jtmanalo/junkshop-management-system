const express = require('express');
const shiftController = require('./controllers');
const router = express.Router();

// Get all shifts
router.get('/shifts', shiftController.getAll);

// Get active shift of userID
router.get('/shifts/active/:userId', shiftController.getActivebyUserID);

// Create a shift
router.post('/shifts', shiftController.create);

// Update a shift
router.put('/shifts/:id', shiftController.update);

module.exports = router;