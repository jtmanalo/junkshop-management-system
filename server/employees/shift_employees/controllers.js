const shiftemployeeService = require('./services');

// Get all shift employees
async function getAll(req, res) {
    try {
        const shiftEmployees = await shiftemployeeService.getAll();
        if (shiftEmployees.length === 0) {
            return res.status(204).send("No shift employees found");
        }
        res.json(shiftEmployees);
    } catch (error) {
        console.error('Error in getAllShiftEmployees:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a shift employee
async function create(req, res) {
    const {
        shiftId,
        firstName,
        lastName
    } = req.body;

    if (!shiftId || !firstName || !lastName) {
        return res.status(400).json({ error: 'ShiftId, FirstName, and LastName are required.' });
    }

    try {
        const shiftEmployee = await shiftemployeeService.create({
            shiftId,
            firstName,
            lastName
        });
        res.status(201).json(shiftEmployee);
    } catch (error) {
        console.error('Error in createShiftEmployee:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get shift employee by ID
async function getById(req, res) {
    try {
        const shiftEmployee = await shiftemployeeService.getById(parseInt(req.params.id));
        if (!shiftEmployee) {
            return res.status(404).send("Shift employee not found");
        }
        res.json(shiftEmployee);
    } catch (error) {
        console.error('Error in getShiftEmployeeById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a shift employee
async function update(req, res) {
    const shiftEmployeeId = parseInt(req.params.id, 10);

    try {
        const updatedShiftEmployee = await shiftemployeeService.update(shiftEmployeeId, req.body);
        res.json(updatedShiftEmployee);
    } catch (error) {
        console.error('Error in updateShiftEmployee:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update
};