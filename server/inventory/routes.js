const express = require('express');
const inventoryController = require('./controllers');
const inventorySvc = require('./services');
const router = express.Router();

// Get all inventory items
router.get('/inventory', inventoryController.getAll);

router.get('/branch-inventory', inventoryController.getBranchInventory);

// Create an inventory item
router.post('/inventory', inventoryController.create);

// Get inventory item by ID
// router.get('/inventory/:id', inventoryController.getById);

// Update an inventory item
router.put('/inventory/:id', inventoryController.update);

router.get('/daily-changes', inventoryController.getDailyInventoryChanges);

// Ensure monthly inventory for all branches (fallback manual trigger)
router.post('/inventories/ensure-month', async (req, res) => {
	try {
		const { year, month } = req.body || {};
		let target;
		if (year && month) {
			const m = String(month).padStart(2, '0');
			target = `${year}-${m}-01`;
		}
		const result = await inventorySvc.ensureMonthlyInventoryForAllBranches(target);
		res.status(201).json(result);
	} catch (err) {
		console.error('Error ensuring monthly inventory:', err);
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;