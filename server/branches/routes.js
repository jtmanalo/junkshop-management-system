const express = require('express');
const branchController = require('./controllers');
const router = express.Router();

// Get all branches of owner by username
// router.get('/branches', branchController.getAll);
router.get('/branches', branchController.getByQuery);

// Create a branch
router.post('/branches', branchController.create);

// Get branch by username
router.get('/branches/:username', branchController.getByUsername);

// Update a branch
router.put('/branches/:id', branchController.update);

router.post('/owners', branchController.createOwner);

router.get('/owners/:referenceId/:ownerType', branchController.getOwner);

// Delete a branch
// router.delete('/branches/:id', branchController.remove);

module.exports = router;