const express = require('express');
const branchController = require('./controllers');
const router = express.Router();

// Get all branches
router.get('/branches', branchController.getAll);

// Create a branch
router.post('/branches', branchController.create);

// Get branch by ID
router.get('/branches/:id', branchController.getById);

// Update a branch
router.put('/branches/:id', branchController.update);

// Delete a branch
// router.delete('/branches/:id', branchController.remove);

module.exports = router;