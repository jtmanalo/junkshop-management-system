const itemService = require('./services');

// Get all items
async function getAll(req, res) {
    try {
        const items = await itemService.getAll();
        if (items.length === 0) {
            return res.status(204).send("No items found");
        }
        res.status(200).json(items);
    } catch (error) {
        console.error('Error in getAllItems:', error);
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
    } = req.body;

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

module.exports = {
    getAll,
    create,
    getById,
    update,
    // remove
};
