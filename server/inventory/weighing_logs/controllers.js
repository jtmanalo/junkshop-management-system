const weighinglogService = require('./services');

// Get all weighing logs
async function getAll(req, res) {
    try {
        const logs = await weighinglogService.getAll();
        if (logs.length === 0) {
            return res.status(204).send("No weighing logs found");
        }
        res.json(logs);
    } catch (error) {
        console.error('Error in getAllWeighingLogs:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a weighing log
async function create(req, res) {
    const {
        branchId,
        transactionId,
        itemId,
        weight,
        userId
    } = req.body;

    if (!branchId || !transactionId || !itemId || !weight || !userId) {
        return res.status(400).json({ error: 'BranchId, TransactionId, ItemId, Weight, and UserId are required.' });
    }

    try {
        const log = await weighinglogService.create({
            branchId,
            transactionId,
            itemId,
            weight,
            userId
        });
        res.status(201).json(log);
    } catch (error) {
        console.error('Error in createWeighingLog:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get weighing log by ID
async function getById(req, res) {
    try {
        const log = await weighinglogService.getById(parseInt(req.params.id));
        if (!log) {
            return res.status(404).send("Weighing log not found");
        }
        res.json(log);
    } catch (error) {
        console.error('Error in getWeighingLogById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a weighing log
async function update(req, res) {
    const logId = parseInt(req.params.id, 10);

    try {
        const updatedLog = await weighinglogService.update(logId, req.body);
        res.json(updatedLog);
    } catch (error) {
        console.error('Error in updateWeighingLog:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update
};