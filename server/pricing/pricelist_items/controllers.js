const pricelistitemService = require('./services');

// Get all pricelist items
async function getAll(req, res) {
    try {
        const pricelistItems = await pricelistitemService.getAll();
        if (pricelistItems.length === 0) {
            return res.status(204).send("No pricelist items found");
        }
        res.json(pricelistItems);
    } catch (error) {
        console.error('Error in getAllPricelistItems:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a pricelist item
async function create(req, res) {
    const {
        pricelistId,
        itemId,
        price
    } = req.body;

    if (!pricelistId || !itemId || !price) {
        return res.status(400).json({ error: 'PricelistID, ItemID, and Price are required.' });
    }

    try {
        const pricelistItem = await pricelistitemService.create({
            pricelistId,
            itemId,
            price
        });
        res.status(201).json(pricelistItem);
    } catch (error) {
        console.error('Error in createPricelistItem:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get pricelist item by ID
// async function getById(req, res) {
//     try {
//         const pricelistItem = await pricelistitemService.getById(parseInt(req.params.id));
//         if (!pricelistItem) {
//             return res.status(404).send("Pricelist item not found");
//         }
//         res.json(pricelistItem);
//     } catch (error) {
//         console.error('Error in getPricelistItemById:', error);
//         res.status(500).json({ error: error.message });
//     }
// }

// Update a pricelist item
// async function update(req, res) {
//     const pricelistItemId = parseInt(req.params.id, 10);

//     try {
//         const updatedPricelistItem = await pricelistitemService.update(pricelistItemId, req.body);
//         res.json(updatedPricelistItem);
//     } catch (error) {
//         console.error('Error in updatePricelistItem:', error);
//         res.status(500).json({ error: error.message });
//     }
// }

// Get all items with prices for a branch
async function getItemsWithPricesForBranch(req, res) {
    const { branchId } = req.query;

    // Validate branchId
    if (!branchId || isNaN(branchId)) {
        return res.status(400).json({ error: 'Invalid or missing BranchID.' });
    }

    try {
        const items = await pricelistitemService.getItemsWithPricesForBranch(branchId);
        res.json(items);
    } catch (error) {
        console.error('Error in getItemsWithPricesForBranch:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update or create a pricelist item
async function updateOrCreatePricelistItemForBranch(req, res) {
    const { branchId, itemId, price } = req.body;

    if (!branchId || !itemId || price === undefined) {
        return res.status(400).json({ error: 'BranchID, ItemID, and Price are required.' });
    }

    try {
        const result = await pricelistitemService.updateOrCreatePricelistItemForBranch(branchId, itemId, price);
        res.json(result);
    } catch (error) {
        console.error('Error in updateOrCreatePricelistItem:', error);
        res.status(500).json({ error: error.message });
    }
}

async function updateOrCreatePricelistItemForBuyer(req, res) {
    const { buyerId, itemId, price } = req.body;

    if (!buyerId || !itemId || price === undefined) {
        return res.status(400).json({ error: 'BuyerID, ItemID, and Price are required.' });
    }

    try {
        const result = await pricelistitemService.updateOrCreatePricelistItemForBuyer(buyerId, itemId, price);
        res.json(result);
    } catch (error) {
        console.error('Error in updateOrCreatePricelistItem:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    // getById,
    // update,
    getItemsWithPricesForBranch,
    updateOrCreatePricelistItemForBranch,
    updateOrCreatePricelistItemForBuyer
};