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

        // console.log('UserID for new branch:', user.UserID);
        // Fetch OwnerID from the owner table
        const owner = await branchService.getOwner(user.UserID, 'user');
        if (!owner || !owner.OwnerID) {
            // console.log('Owner not found, creating new owner.');
            const newOwner = await branchService.addOwner({
                referenceId: user.UserID,
                ownerType: 'user'
            });
            // console.log('New owner created:', newOwner);

            owner = { OwnerID: newOwner.id, ...newOwner };
        }

        // Create the branch
        const newBranch = await branchService.create({
            name,
            location,
            openingDate,
            ownerId: owner.OwnerID
        });

        res.status(201).json(newBranch);
    } catch (error) {
        console.error('Error in createBranch:', error);
        res.status(500).json({ error: error.message });
    }
}

// BranchPage get branches by Username
async function getByUsername(req, res) {
    const { username } = req.params;
    // console.log('Passing Username to getByUsername:', username);

    try {
        // console.log('Username:', username);
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const branches = await branchService.getByUsername(username);
        if (!branches || branches.length === 0) {
            return res.status(404).send("Branch not found");
        }
        res.json(branches);
    } catch (error) {
        console.error('Error in getBranchByUsername:', error);
        res.status(500).json({ error: error.message });
    }
}

async function createOwner(req, res) {
    const { referenceId, ownerType } = req.body;

    if (!referenceId || !ownerType) {
        return res.status(400).json({ error: 'ReferenceID and OwnerType are required.' });
    }

    try {
        const newOwner = await branchService.addOwner({
            referenceId,
            ownerType
        });

        res.status(201).json(newOwner);
    } catch (error) {
        console.error('Error in createOwner:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getOwner(req, res) {
    const { referenceId, ownerType } = req.params;

    try {
        const owner = await branchService.getOwner(referenceId, ownerType);
        if (!owner) {
            return res.status(404).send("Owner not found");
        }
        res.json(owner);
    } catch (error) {
        console.error('Error in getOwner:', error);
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
    create,
    update,
    getByUsername,
    createOwner,
    getOwner
};