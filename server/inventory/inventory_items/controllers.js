const inventoryitemService = require('./services');

async function getAll(req, res) {
    try {
        const items = await inventoryitemService.getAll();
        if (items.length === 0) {
            return res.status(204).send("No inventory items found");
        }
        res.json(items);
    } catch (error) {
        console.error('Error in getAllInventoryItems:', error);
        res.status(500).json({ error: error.message });
    }
}

async function create(req, res) {
    const {
        inventoryId,
        itemId,
        totalQuantity
    } = req.body;

    if (!inventoryId || !itemId || totalQuantity == null) {
        return res.status(400).json({ error: 'InventoryId, ItemId, and TotalQuantity are required.' });
    }

    try {
        const item = await inventoryitemService.create({
            inventoryId,
            itemId,
            totalQuantity
        });
        res.status(201).json(item);
    } catch (error) {
        console.error('Error in createInventoryItem:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await inventoryitemService.getById(parseInt(req.params.id));
        if (!item) {
            return res.status(404).send("Inventory item not found");
        }
        res.json(item);
    } catch (error) {
        console.error('Error in getInventoryItemById:', error);
        res.status(500).json({ error: error.message });
    }
}

async function update(req, res) {
    const itemId = parseInt(req.params.id, 10);

    try {
        const updatedItem = await inventoryitemService.update(itemId, req.body);
        res.json(updatedItem);
    } catch (error) {
        console.error('Error in updateInventoryItem:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update
};