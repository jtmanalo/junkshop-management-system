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

module.exports = {
    getAll,
    create,
    getById,
    update
};

