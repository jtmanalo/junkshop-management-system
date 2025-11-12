const employeeService = require('./services');

// Get all employees
async function getAll(req, res) {
    try {
        const employees = await employeeService.getAll();
        if (employees.length === 0) {
            return res.status(204).send("No employees found");
        }
        res.json(employees);
    } catch (error) {
        console.error('Error in getAllEmployees:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create an employee
async function create(req, res) {
    const {
        userId,
        positionTitle,
        firstName,
        middleName,
        lastName,
        nickname,
        displayPictureURL,
        contactNumber,
        address,
        hireDate,
        status
    } = req.body;

    if (!positionTitle || !firstName || !lastName || !hireDate) {
        return res.status(400).json({ error: 'PositionTitle, FirstName, LastName, and HireDate are required.' });
    }

    try {
        const employee = await employeeService.create({
            userId,
            positionTitle,
            firstName,
            middleName,
            lastName,
            nickname,
            displayPictureURL,
            contactNumber,
            address,
            hireDate,
            status
        });
        res.status(201).json(employee);
    } catch (error) {
        console.error('Error in createEmployee:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get employee by ID
async function getById(req, res) {
    try {
        const employee = await employeeService.getById(parseInt(req.params.id));
        if (!employee) {
            return res.status(404).send("Employee not found");
        }
        res.json(employee);
    } catch (error) {
        console.error('Error in getEmployeeById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update an employee
async function update(req, res) {
    const employeeId = parseInt(req.params.id, 10);

    try {
        const updatedEmployee = await employeeService.update(employeeId, req.body);
        res.json(updatedEmployee);
    } catch (error) {
        console.error('Error in updateEmployee:', error);
        res.status(500).json({ error: error.message });
    }
}

// Delete an employee
// async function remove(req, res) {
//     try {
//         const employeeId = parseInt(req.params.id);
//         const result = await employeeService.remove(employeeId);

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: 'Employee not found' });
//         }

//         res.status(200).json({ message: 'Employee deleted successfully' });
//     } catch (error) {
//         console.error('Error in deleteEmployee:', error);
//         res.status(500).json({ error: error.message });
//     }
// }

module.exports = {
    getAll,
    create,
    getById,
    update
    // remove,
};