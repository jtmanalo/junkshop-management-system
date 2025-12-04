const pricelistService = require('./services');

// Get all pricelists
async function getAll(req, res) {
    try {
        const pricelists = await pricelistService.getAll();
        if (pricelists.length === 0) {
            return res.status(204).send("No pricelists found");
        }
        res.json(pricelists);
    } catch (error) {
        console.error('Error in getAllPricelists:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a pricelist
async function create(req, res) {
    const {
        buyerId,
        branchId,
        dateEffective
    } = req.body;

    if (!branchId || !dateEffective) {
        return res.status(400).json({ error: 'BranchId and DateEffective are required.' });
    }

    try {
        const pricelist = await pricelistService.create({
            buyerId: buyerId || null,
            branchId,
            dateEffective
        });
        res.status(201).json(pricelist);
    } catch (error) {
        console.error('Error in createPricelist:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get pricelist by ID
async function getById(req, res) {
    try {
        const pricelist = await pricelistService.getById(parseInt(req.params.id));
        if (!pricelist) {
            return res.status(404).send("Pricelist not found");
        }
        res.json(pricelist);
    } catch (error) {
        console.error('Error in getPricelistById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a pricelist
async function update(req, res) {
    const pricelistId = parseInt(req.params.id, 10);

    try {
        const updatedPricelist = await pricelistService.update(pricelistId, req.body);
        res.json(updatedPricelist);
    } catch (error) {
        console.error('Error in updatePricelist:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getPriceTrendController(req, res) { // Renamed to avoid confusion
    // Parameters from the frontend (Axios GET query string)
    const { itemId, entityId, entityType } = req.query;

    if (!itemId || !entityId || !entityType) {
        return res.status(400).json({ error: 'itemId, entityId, and entityType are required query parameters.' });
    }

    // Ensure entityType is normalized (e.g., 'Branch' vs 'branch')
    const normalizedEntityType = entityType.toLowerCase();
    if (normalizedEntityType !== 'buyer' && normalizedEntityType !== 'branch') {
        return res.status(400).json({ error: 'Invalid entityType. Must be "Buyer" or "Branch".' });
    }

    try {
        // Call the service function
        const trendData = await pricelistService.getPriceTrend(itemId, entityId, entityType);
        res.json(trendData);
    } catch (error) {
        // Pass a user-friendly error message, not the raw SQL error
        console.error('Error in getPriceTrendController:', error);
        res.status(500).json({ error: 'Failed to retrieve price trend due to server error.' });
    }
}

async function getNetIncomeTrendController(req, res) {
    const { year } = req.query;

    if (!year) {
        return res.status(400).json({ error: 'Year is required for the net income trend report.' });
    }

    try {
        const data = await pricelistService.fetchNetIncomeTrend(year);
        res.json(data); // Send monthly summary data
    } catch (error) {
        res.status(500).json({ error: 'Server error while fetching income trend.' });
    }
}


module.exports = {
    getAll,
    create,
    getById,
    update,
    getPriceTrendController,
    getNetIncomeTrendController
};

