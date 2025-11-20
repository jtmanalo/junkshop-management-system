const express = require('express');
const branchController = require('./controllers');
const router = express.Router();

// Get all branches of owner by username
// router.get('/branches', branchController.getAll);
router.get('/branches', branchController.getByQuery);

// Create a branch
router.post('/branches', branchController.create);

// Get branch by owner ID
router.get('/branches/:id', branchController.getByOwnerId);

// Update a branch
router.put('/branches/:id', branchController.update);

// Delete a branch
// router.delete('/branches/:id', branchController.remove);

module.exports = router;