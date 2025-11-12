const express = require('express');
const employeeController = require('./controllers');
const router = express.Router();

// Get all employees
router.get('/employees', employeeController.getAll);

// Create an employee
router.post('/employees', employeeController.create);

// Get employee by ID
router.get('/employees/:id', employeeController.getById);

// Update an employee
router.put('/employees/:id', employeeController.update);

// Delete an employee
// router.delete('/employees/:id', employeeController.remove);

module.exports = router;