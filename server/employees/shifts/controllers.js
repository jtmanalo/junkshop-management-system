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

// Create a shift
async function create(req, res) {
    const {
        branchId,
        userId,
        startDatetime,
        endDatetime,
        initialCash,
        finalCash
    } = req.body;
    if (!branchId || !userId || !startDatetime || !initialCash) {
        return res.status(400).json({ error: 'BranchId, UserId, StartDatetime, and InitialCash are required.' });
    }

    try {
        const shift = await shiftService.create({
            branchId,
            userId,
            startDatetime,
            endDatetime,
            initialCash,
            finalCash
        });
        res.status(201).json(shift);
    } catch (error) {
        console.error('Error in createShift:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get shift by ID
async function getById(req, res) {
    try {
        const shift = await shiftService.getById(parseInt(req.params.id));
        if (!shift) {
            return res.status(404).send("Shift not found");
        }
        res.json(shift);
    } catch (error) {
        console.error('Error in getShiftById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a shift
async function update(req, res) {
    const shiftId = parseInt(req.params.id, 10);

    try {
        const updatedShift = await shiftService.update(shiftId, req.body);
        res.json(updatedShift);
    } catch (error) {
        console.error('Error in updateShift:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getByUserId(req, res) {
    try {
        const shifts = await shiftService.getByUserId(parseInt(req.params.userId, 10));
        if (shifts.length === 0) {
            return res.status(204).send("No shifts found for the user");
        }
        res.json(shifts);
    } catch (error) {
        console.error('Error in getShiftsByUserId:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update,
    getByUserId
};