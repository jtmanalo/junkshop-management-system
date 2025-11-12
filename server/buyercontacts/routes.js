const express = require('express');
const router = express.Router({ mergeParams: true });
const buyerContactController = require('./controllers');

// Get all contacts
router.get('/contacts', buyerContactController.getAll);

// Create a buyer contact
router.post('/:buyerId/contacts', buyerContactController.create);

// Get all contacts of a buyer
router.get('/:buyerId/contacts', buyerContactController.getByBuyerId);

// Update a buyer contact
router.put('/:buyerId/contacts/:contactId', buyerContactController.update);

// Delete a buyer contact
// router.delete('/:buyerId/contacts/:contactId', buyerContactController.remove);

module.exports = router;