const shiftService = require('./services');

// Get all shifts
async function getAll(req, res) {
    try {
        const shifts = await shiftService.getAll();
        if (shifts.length === 0) {
            return res.status(204).send("No shifts found");
        }
        res.json(shifts);
    } catch (error) {
        console.error('Error in getAllShifts:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getShiftDetails(req, res) {
    try {
        const shiftDetails = await shiftService.getShiftDetails();
        if (shiftDetails.length === 0) {
            return res.status(204).send("No shifts found");
        }
        res.json(shiftDetails);
    } catch (error) {
        console.error('Error in getShiftDetails:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getActivebyUserID(req, res) {
    try {
        const shifts = await shiftService.getActivebyUserID(parseInt(req.params.userId, 10));
        if (shifts.length === 0) {
            return res.status(204).send("No active shifts found");
        }
        res.json(shifts);
    } catch (error) {
        console.error('Error in getAllActiveShifts:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a shift
async function create(req, res) {
    const {
        branchId,
        userId,
        initialCash,
        notes
    } = req.body;
    if (!branchId || !userId || !initialCash) {
        return res.status(400).json({ error: 'BranchId, UserId, and InitialCash are required.' });
    }

    try {
        const shift = await shiftService.create({
            branchId,
            userId,
            initialCash,
            notes
        });
        res.status(201).json(shift);
    } catch (error) {
        console.error('Error in createShift:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a shift
async function update(req, res) {
    const shiftId = parseInt(req.params.id, 10);

    try {
        const updatedShift = await shiftService.endShift(shiftId, req.body.finalCash);
        res.json(updatedShift);
    } catch (error) {
        console.error('Error in updateShift:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getBalance(req, res) {
    const { branchId, userId } = req.query;
    try {
        const balance = await shiftService.getBalance(branchId, userId);
        res.json(balance);
    } catch (error) {
        console.error('Error in getBalance:', error);
        res.status(500).json({ error: error.message });
    }
}

async function addCapital(req, res) {
    const shiftId = parseInt(req.params.id, 10);
    const { amount, branchId, userId, notes } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'A valid amount is required.' });
    }

    if (!branchId || !userId) {
        return res.status(400).json({ error: 'BranchId and UserId are required.' });
    }

    try {
        const updatedShift = await shiftService.addCapital(shiftId, amount, branchId, userId, notes);
        res.json(updatedShift);
    } catch (error) {
        console.error('Error in addCapital:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    update,
    getActivebyUserID,
    getBalance,
    getShiftDetails,
    addCapital
};