const pricelistactivityService = require('./services');

// Get all pricelist activities
async function getAll(req, res) {
    try {
        const activities = await pricelistactivityService.getAll();
        if (activities.length === 0) {
            return res.status(204).send("No pricelist activities found");
        }
        res.json(activities);
    } catch (error) {
        console.error('Error in getAllPricelistActivities:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a pricelist activity
async function create(req, res) {
    const {
        pricelistitemId,
        oldPrice,
        newPrice,
        userId
    } = req.body;

    if (!pricelistitemId || !oldPrice || !newPrice || !userId) {
        return res.status(400).json({ error: 'PricelistItemId, OldPrice, NewPrice, and UserId are required.' });
    }

    try {
        const activity = await pricelistactivityService.create({
            pricelistitemId,
            oldPrice,
            newPrice,
            userId
        });
        res.status(201).json(activity);
    } catch (error) {
        console.error('Error in createPricelistActivity:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get pricelist activity by ID
async function getById(req, res) {
    try {
        const activity = await pricelistactivityService.getById(parseInt(req.params.id));
        if (!activity) {
            return res.status(404).send("Pricelist activity not found");
        }
        res.json(activity);
    } catch (error) {
        console.error('Error in getPricelistActivityById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a pricelist activity
async function update(req, res) {
    const activityId = parseInt(req.params.id, 10);

    try {
        const updatedActivity = await pricelistactivityService.update(activityId, req.body);
        res.json(updatedActivity);
    } catch (error) {
        console.error('Error in updatePricelistActivity:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update
};