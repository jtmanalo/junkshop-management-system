const express = require('express');
const branchController = require('./controllers');
const router = express.Router();

// Create a branch
router.post('/branches', branchController.create);

// Get all branches by username
router.get('/branches/:username', branchController.getByUsername);

// Update a branch
router.put('/branches/:id', branchController.update);

router.post('/owners', branchController.createOwner);

router.get('/owners/:referenceId/:ownerType', branchController.getOwner);

module.exports = router;