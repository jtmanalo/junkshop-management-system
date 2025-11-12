const express = require('express');
const router = express.Router({ mergeParams: true });
const contactController = require('./controllers');

// Get all contacts
router.get('/contacts', contactController.getAll);

// Create a buyer contact
router.post('/:buyerId/contacts', contactController.create);

// Get all contacts of a buyer
router.get('/:buyerId/contacts', contactController.getByBuyerId);

// Update a buyer contact
router.put('/:buyerId/contacts/:contactId', contactController.update);

// Delete a buyer contact
// router.delete('/:buyerId/contacts/:contactId', contactController.remove);

module.exports = router;