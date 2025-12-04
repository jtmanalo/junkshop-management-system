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

// async function getById(req, res) {
//     try {
//         const item = await inventoryitemService.getById(parseInt(req.params.id));
//         if (!item) {
//             return res.status(404).send("Inventory item not found");
//         }
//         res.json(item);
//     } catch (error) {
//         console.error('Error in getInventoryItemById:', error);
//         res.status(500).json({ error: error.message });
//     }
// }

async function recordPrevious(req, res) {
    try {
        const updatedItem = await inventoryitemService.recordPrevious(req.body);
        res.json(updatedItem);
    } catch (error) {
        console.error('Error in recordPreviousInventoryItem:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getPreviousRecords(req, res) {
    try {
        const branchId = parseInt(req.query.branchId);
        const month = parseInt(req.query.month);
        const year = parseInt(req.query.year);
        console.log('Received branchId:', branchId, 'month:', month, 'year:', year);
        if (isNaN(branchId)) {
            return res.status(400).json({ error: 'Invalid or missing branchId parameter.' });
        }

        const items = await inventoryitemService.getPreviousRecords(branchId, month, year);
        if (items.length === 0) {
            return res.status(204).send("No previous inventory records found for the specified branch");
        }
        res.json(items);
    } catch (error) {
        console.error('Error in getPreviousInventoryRecords:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    // getById,
    recordPrevious,
    getPreviousRecords
};