const activitylogService = require('./services');

async function getAll(req, res) {
    try {
        const logs = await activitylogService.getAll();
        if (logs.length === 0) {
            return res.status(204).send("No activity logs found");
        }
        res.json(logs);
    } catch (error) {
        console.error('Error in getAllActivityLogs:', error);
        res.status(500).json({ error: error.message });
    }
}

async function create(req, res) {
    const {
        userId,
        branchId,
        entityType,
        entityId,
        activityType,
        description,
        timestamp
    } = req.body;
    if (!userId || !branchId || !entityType || !entityId || !activityType || !description || !timestamp) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        const log = await activitylogService.create({
            userId,
            branchId,
            entityType,
            entityId,
            activityType,
            description,
            timestamp
        });
        res.status(201).json(log);
    } catch (error) {
        console.error('Error in createActivityLog:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getById(req, res) {
    try {
        const log = await activitylogService.getById(parseInt(req.params.id));
        if (!log) {
            return res.status(404).send("Activity log not found");
        }
        res.json(log);
    } catch (error) {
        console.error('Error in getActivityLogById:', error);
        res.status(500).json({ error: error.message });
    }
}

async function update(req, res) {
    const logId = parseInt(req.params.id, 10);
    try {
        const updatedLog = await activitylogService.update(logId, req.body);
        res.json(updatedLog);
    } catch (error) {
        console.error('Error in updateActivityLog:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update
};