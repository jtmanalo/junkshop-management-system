const inventoryService = require('./services');

// Get all inventory items
async function getAll(req, res) {
    try {
        const items = await inventoryService.getAll();
        if (items.length === 0) {
            return res.status(204).send("No inventory items found");
        }
        res.json(items);
    } catch (error) {
        console.error('Error getAllInventoryItems:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getBranchInventory(req, res) {
    const branchId = parseInt(req.params.branchId, 10);
    try {
        const items = await inventoryService.getByBranch(branchId);
        if (items.length === 0) {
            return res.status(204).send("No inventory items found for this branch");
        }
        res.json(items);
    } catch (error) {
        console.error('Error getBranchInventoryItems:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Create an inventory item
async function create(req, res) {
    const {
        branchId,
        date
    } = req.body;
    try {
        const newItem = await inventoryService.create({
            branchId,
            date
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error createInventoryItem:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get inventory item by ID
async function getById(req, res) {
    try {
        const item = await inventoryService.getById(parseInt(req.params.id, 10));
        if (!item) {
            return res.status(404).send("Inventory item not found");
        }
        res.json(item);
    } catch (error) {
        console.error('Error getInventoryItemById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update an inventory item
async function update(req, res) {
    const itemId = parseInt(req.params.id, 10);
    const { branchId, date } = req.body;

    try {
        const updatedItem = await inventoryService.update(itemId, {
            branchId,
            date
        });
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updateInventoryItem:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update,
    getBranchInventory
};