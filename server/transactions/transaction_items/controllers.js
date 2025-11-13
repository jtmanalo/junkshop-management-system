const transactionitemService = require('./services');

// Get all transaction items
async function getAll(req, res) {
    try {
        const transactionItems = await transactionitemService.getAll();
        if (transactionItems.length === 0) {
            return res.status(204).send("No transaction items found");
        }
        res.json(transactionItems);
    } catch (error) {
        console.error('Error in getAllTransactionItems:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a transaction item
async function create(req, res) {
    const {
        transactionId,
        itemId,
        quantity,
        price,
        subtotal
    } = req.body;

    if (!transactionId || !itemId || !quantity || !price || !subtotal) {
        return res.status(400).json({ error: 'TransactionId, ItemId, Quantity, Price, and Subtotal are required.' });
    }

    try {
        const transactionItem = await transactionitemService.create({
            transactionId,
            itemId,
            quantity,
            price,
            subtotal
        });
        res.status(201).json(transactionItem);
    } catch (error) {
        console.error('Error in createTransactionItem:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get transaction item by ID
async function getById(req, res) {
    try {
        const transactionItem = await transactionitemService.getById(parseInt(req.params.id));
        if (!transactionItem) {
            return res.status(404).send("Transaction item not found");
        }
        res.json(transactionItem);
    } catch (error) {
        console.error('Error in getTransactionItemById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a transaction item
async function update(req, res) {
    const transactionItemId = parseInt(req.params.id, 10);

    try {
        const updatedTransactionItem = await transactionitemService.update(transactionItemId, req.body);
        res.json(updatedTransactionItem);
    } catch (error) {
        console.error('Error in updateTransactionItem:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update
};
