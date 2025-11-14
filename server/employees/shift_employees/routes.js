const express = require('express');
const shiftemployeeController = require('./controllers');
const router = express.Router();

// Get all shift employees
router.get('/shift_employees', shiftemployeeController.getAll);
// Create a shift employee
router.post('/shift_employees', shiftemployeeController.create);

// Get shift employee by ID
router.get('/shift_employees/:id', shiftemployeeController.getById);

// Update a shift employee
router.put('/shift_employees/:id', shiftemployeeController.update);

// Delete a shift employee
// router.delete('/shift_employees/:id', shiftemployeeController.remove);

module.exports = router;