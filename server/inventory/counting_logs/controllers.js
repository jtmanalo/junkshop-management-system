const countinglogService = require('./services');

// Get all counting logs
async function getAll(req, res) {
    try {
        const logs = await countinglogService.getAll();
        if (logs.length === 0) {
            return res.status(204).send("No counting logs found");
        }
        res.json(logs);
    } catch (error) {
        console.error('Error in getAllCountingLogs:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a weighing log
async function create(req, res) {
    const {
        branchId,
        transactionId,
        itemId,
        countedQuantity,
        userId
    } = req.body;

    if (!branchId || !transactionId || !itemId || !countedQuantity || !userId) {
        return res.status(400).json({ error: 'BranchId, TransactionId, ItemId, CountedQuantity, and UserId are required.' });
    }

    try {
        const log = await countinglogService.create({
            branchId,
            transactionId,
            itemId,
            countedQuantity,
            userId
        });
        res.status(201).json(log);
    } catch (error) {
        console.error('Error in createCountingLog:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get counting log by ID
async function getById(req, res) {
    try {
        const log = await countinglogService.getById(parseInt(req.params.id));
        if (!log) {
            return res.status(404).send("Counting log not found");
        }
        res.json(log);
    } catch (error) {
        console.error('Error in getCountingLogById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a counting log
async function update(req, res) {
    const logId = parseInt(req.params.id, 10);

    try {
        const updatedLog = await countinglogService.update(logId, req.body);
        res.json(updatedLog);
    } catch (error) {
        console.error('Error in updateCountingLog:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update
};