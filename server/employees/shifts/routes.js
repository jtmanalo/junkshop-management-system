const express = require('express');
const shiftController = require('./controllers');
const router = express.Router();

// Get all shifts
router.get('/shifts', shiftController.getAll);

// Get shift details
router.get('/shift-details', shiftController.getShiftDetails);

// Get active shift of userID
router.get('/shifts/active/:userId', shiftController.getActivebyUserID);

// Get balance
router.get('/balance', shiftController.getBalance);

// Create a shift
router.post('/shifts', shiftController.create);

router.post('/shifts/:id/add-capital', shiftController.addCapital);

// Update a shift
router.put('/shifts/:id', shiftController.update);

module.exports = router;