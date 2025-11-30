const express = require('express');
const shiftemployeeController = require('./controllers');
const router = express.Router();

// Get all shift employees
router.get('/shift-employees', shiftemployeeController.getAll);
// Create a shift employee
router.post('/shift-employees', shiftemployeeController.create);

// Get shift employee by ID
router.get('/shift-employees/:id', shiftemployeeController.getById);

// Update a shift employee
router.put('/shift-employees/:id', shiftemployeeController.update);

// Delete a shift employee
// router.delete('/shift-employees/:id', shiftemployeeController.remove);

module.exports = router;