const branchService = require('./services');
const userService = require('../users/services');

// BranchPage create branch for user
// adds user to owner table if not yet existing
async function create(req, res) {
    const { name, location, openingDate, username } = req.body;

    if (!name || !location || !openingDate || !username) {
        return res.status(400).json({ error: 'Name, Location, OpeningDate, and Username are required.' });
    }

    try {
        // Fetch user details to get UserID
        const user = await userService.getByUsername(username);
        if (!user || !user.UserID) {
            return res.status(400).json({ error: 'Invalid Username provided.' });
        }

        // Create the branch
        const newBranch = await branchService.createBranch({
            name,
            location,
            openingDate
        });

        try {
            // Create the pricelist
            await branchService.createPricelist(newBranch.id);
            // Create inventory
            await branchService.createInventory(newBranch.id);
        } catch (error) {
            console.error('Error creating pricelist:', error);
            return res.status(500).json({ error: 'Failed to create pricelist.' });
        }

        res.status(201).json(newBranch);
    } catch (error) {
        console.error('Error in createBranch:', error);
        res.status(500).json({ error: error.message });
    }
}

// BranchPage get branches by Username
async function getBranchesofOwner(req, res) {
    try {
        const branches = await branchService.getBranchesofOwner();
        if (!branches || branches.length === 0) {
            return res.status(404).send("Branch not found");
        }
        res.json(branches);
    } catch (error) {
        console.error('Error in getBranchByUsername:', error);
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

async function getBrancheswithUserTypeOwner(req, res) {
    try {
        const branches = await branchService.getBrancheswithUserTypeOwner();
        res.json(branches);
    } catch (error) {
        console.error('Error in getBrancheswithUserTypeOwner:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    create,
    update,
    getBranchesofOwner,
    getBrancheswithUserTypeOwner
};