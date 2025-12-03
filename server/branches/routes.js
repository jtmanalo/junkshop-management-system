const express = require('express');
const branchController = require('./controllers');
const router = express.Router();

// Create a branch for owner+user
// if owner, branch+pricelist
router.post('/branches', branchController.create);

// Get all branches of owner
router.get('/branches', branchController.getBranchesofOwner);

// Get all branches where owner has usertype 'owner'
router.get('/branches-with-owner-usertype', branchController.getBrancheswithUserTypeOwner);

// Update a branch
router.put('/branches/:id', branchController.update);

module.exports = router;