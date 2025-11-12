const branchService = require('./services');

// Get all branches
async function getAll(req, res) {
    try {
        const branches = await branchService.getAll();
        if (branches.length === 0) {
            return res.status(204).send("No branches found");
        }
        res.json(branches);
    } catch (error) {
        console.error('Error in getAllBranches:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a branch
async function create(req, res) {
    const { name, location, openingDate } = req.body;

    if (!name || !location || !openingDate) {
        return res.status(400).json({ error: 'Name, Location, and OpeningDate are required.' });
    }

    try {
        const branch = await branchService.create({ name, location, openingDate });
        res.status(201).json(branch);
    } catch (error) {
        console.error('Error in createBranch:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get branch by ID
async function getById(req, res) {
    try {
        const branch = await branchService.getById(parseInt(req.params.id));
        if (!branch) {
            return res.status(404).send("Branch not found");
        }
        res.json(branch);
    } catch (error) {
        console.error('Error in getBranchById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a branch
async function update(req, res) {
    const branchId = parseInt(req.params.id, 10);

    try {
        const updatedBranch = await branchService.update(branchId, req.body);
        res.json(updatedBranch);
    } catch (error) {
        console.error('Error in updateBranch:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update
};