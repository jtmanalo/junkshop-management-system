const itemService = require('./services');

// Items Page get all items of a branch with pricing
async function getAllItemsWithPricing(req, res) {
    try {
        const items = await itemService.getAllItemsWithPricing();
        if (items.length === 0) {
            return res.status(204).send("No items found");
        }
        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getAllItemsWithPricing:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getAllItemsWithActivePricing(req, res) {
    try {
        const items = await itemService.getAllItemsWithActivePricing();
        if (items.length === 0) {
            return res.status(204).send("No items found");
        }
        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getAllItemsWithPricing:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getItemsWithPrice(req, res) {
    const { branchId } = req.params;

    if (!branchId) {
        return res.status(400).json({ error: 'BranchID is required' });
    }

    try {
        const items = await itemService.getItemsWithPrice(branchId);
        if (!items) {
            return res.status(404).send("Item not found");
        }
        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getItemsWithPrice:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getActivePriceItems(req, res) {
    const { branchId } = req.params;

    if (!branchId) {
        return res.status(400).json({ error: 'BranchID is required' });
    }

    try {
        const items = await itemService.getActivePriceItems(branchId);
        if (!items) {
            return res.status(404).send("Item not found");
        }
        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getItemsWithPrice:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getItemsOfBuyerWithPrice(req, res) {
    const { buyerId } = req.params;

    if (!buyerId) {
        return res.status(400).json({ error: 'BuyerID is required' });
    }

    try {
        const items = await itemService.getItemsOfBuyerWithPrice(buyerId);
        if (!items) {
            return res.status(404).send("Item not found");
        }
        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getItemsOfBuyerWithPrice:', error);
        res.status(500).json({ error: error.message });
    }
}

// Items Page get all items
async function getAllItems(req, res) {
    try {
        const items = await itemService.getAllItems();
        if (items.length === 0) {
            return res.status(204).send("No items found");
        }
        res.json(items);
    } catch (error) {
        console.error('Error in getAllItems:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getItemsWithPricesForBranch(req, res) {
    const { branchId } = req.query;

    if (!branchId) {
        return res.status(400).json({ error: 'BranchID is required' });
    }

    try {
        const items = await itemService.getItemsWithPricesForBranch(branchId);
        if (items.length === 0) {
            return res.status(204).send("No items found");
        }
        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getItemsWithPricesForBranch:', error);
        res.status(500).json({ error: error.message });
    }
}

async function crossReferenceItemsWithPrices(req, res) {
    const { branchId, buyerId } = req.query;

    if (!branchId && !buyerId) {
        return res.status(400).json({ error: 'Either BranchID or BuyerID is required' });
    }

    try {
        const allItems = await itemService.getAllItems();
        if (allItems.length === 0) {
            return res.status(204).send("No items found");
        }

        let itemsWithPrices;
        if (branchId) {
            itemsWithPrices = await itemService.getItemsWithPricesForBranch(branchId);
        } else if (buyerId) {
            itemsWithPrices = await itemService.getItemsWithPricesForBuyer(buyerId);
        }

        // Create a map for quick lookup of prices by ItemID
        const priceMap = new Map();
        itemsWithPrices.forEach(item => {
            const key = `${item.Name}-${item.Classification || ''}`.trim();
            priceMap.set(key, item.ItemPrice);
        });

        // Cross-reference all items with the price map
        const crossReferencedItems = allItems.map(item => {
            const key = `${item.Name}-${item.Classification || ''}`.trim();
            return {
                id: item.ItemID,
                name: item.Name,
                classification: item.Classification,
                unitOfMeasurement: item.UnitOfMeasurement,
                price: priceMap.get(key) || ""
            };
        });

        res.status(200).json(crossReferencedItems);
    } catch (error) {
        console.error('Error in crossReferenceItemsWithPrices:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create an item
async function create(req, res) {
    const {
        name,
        description,
        unitOfMeasurement,
        classification,
        userId
    } = req.body;

    console.log('Create item request body:', req.body);
    if (!name || !unitOfMeasurement) {
        return res.status(400).json({ error: 'Name and UnitOfMeasurement are required' });
    }

    try {
        const item = await itemService.create({
            name,
            unitOfMeasurement,
            classification,
            description
        });

        // Get username for activity log
        const username = await itemService.getUsernameById(userId);

        await itemService.createActivityLog({
            userId: userId,
            activityType: 'create',
            description: `Item ${name} created by user ${username}.`,
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Error in createItem:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get item by ID
async function getById(req, res) {
    try {
        const item = await itemService.getById(parseInt(req.params.id));
        if (!item) {
            return res.status(404).send("Item not found");
        }
        res.json(item);
    } catch (error) {
        console.error('Error in getItemById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update an item
async function update(req, res) {
    const itemId = parseInt(req.params.id, 10);

    try {
        const updatedItem = await itemService.update(itemId, req.body);
        res.json(updatedItem);
    } catch (error) {
        console.error('Error in updateItem:', error);
        res.status(500).json({ error: error.message });
    }
}

async function updateItemPriceForBranch(req, res) {
    const { branchId, itemId, itemPrice, userId } = req.body;

    if (!branchId || !itemId || !userId || itemPrice === undefined) {
        return res.status(400).json({ error: 'BranchID, ItemID, UserID and ItemPrice are required.' });
    }

    try {
        const result = await itemService.updateItemPriceForBranch(branchId, itemId, itemPrice, userId);

        // const username = await itemService.getUsernameById(userId);

        // await itemService.createActivityLog({
        //     userId: userId,
        //     activityType: 'update',
        //     description: `User ${username} updated price for ItemID ${itemId} in BranchID ${branchId} to ${itemPrice}.`,
        // });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in updateItemPriceForBranch:', error);
        res.status(500).json({ error: error.message });
    }
}

async function updateItemPriceForBuyer(req, res) {
    const { buyerId, itemId, itemPrice, userId } = req.body;

    if (!buyerId || !itemId || !userId || itemPrice === undefined) {
        return res.status(400).json({ error: 'BuyerID, ItemID, UserID and ItemPrice are required.' });
    }

    try {
        const result = await itemService.updateItemPriceForBuyer(buyerId, itemId, itemPrice, userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in updateItemPriceForBuyer:', error);
        res.status(500).json({ error: error.message });
    }
}

// New: Get daily accumulation per item for a branch/month/year
async function getDailyAccumulation(req, res) {
    const { branchId, year, month } = req.query;

    if (!branchId || !year || !month) {
        return res.status(400).json({ error: 'branchId, year and month are required' });
    }

    try {
        const result = await itemService.getDailyAccumulation({ branchId: parseInt(branchId, 10), year: parseInt(year, 10), month: parseInt(month, 10) });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getDailyAccumulation:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllItemsWithPricing,
    getAllItems,
    getItemsWithPricesForBranch,
    crossReferenceItemsWithPrices,
    create,
    getById,
    update,
    updateItemPriceForBranch,
    updateItemPriceForBuyer,
    getItemsWithPrice,
    getItemsOfBuyerWithPrice,
    getDailyAccumulation,
    getAllItemsWithActivePricing,
    getActivePriceItems
    // remove
};
