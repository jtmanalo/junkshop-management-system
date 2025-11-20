const branchService = require('./services');
const userService = require('../users/services');
const { use } = require('./routes');

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
        const owner = await branchService.getOwnerByReferenceId(user.UserID, 'user');
        if (!owner || !owner.OwnerID) {
            return res.status(400).json({ error: 'Owner not found for the given UserID.' });
        }

        // console.log('OwnerID for new branch:', owner.OwnerID);

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

// Get branch by ID
async function getByOwnerId(req, res) {
    // console.log("REQ", req.params)
    const ownerId = parseInt(req.params.id, 10);
    // console.log('OwnerID:', ownerId);

    if (isNaN(ownerId)) {
        return res.status(400).json({ error: 'Invalid OwnerID' });
    }

    try {
        const branch = await branchService.getByOwnerId(ownerId);
        if (!branch) {
            return res.status(404).send("Branch not found");
        }
        res.json(branch);
    } catch (error) {
        console.error('Error in getBranchByOwnerId:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get branch by username
async function getByUsername(req, res) {
    const { username } = req.params;

    try {
        // console.log('Username:', username);

        const user = await userService.getByUsername(username);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // console.log('UserID:', user.UserID);

        if (!user.UserID || isNaN(user.UserID)) {
            return res.status(400).json({ error: 'Invalid UserID retrieved for username' });
        }

        const branches = await branchService.getByUsername(user.UserID);
        if (!branches) {
            return res.status(404).send("Branch not found");
        }
        res.json(branches);
    } catch (error) {
        console.error('Error in getBranchByUsername:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getByQuery(req, res) {
    const { username } = req.query;
    // console.log('Fetching branches for User:', username);

    try {
        // if (ownerId) {
        //     const branch = await branchService.getByOwnerId(parseInt(ownerId, 10));
        //     if (!branch) {
        //         return res.status(404).send("Branch not found");
        //     }
        //     return res.json(branch);
        // }

        if (username) {
            // console.log('Entering getByUsername function');
            const user = await userService.getByUsername(username);
            // console.log('Username parameter:', username);

            if (!user) {
                return res.status(404).send("User not found");
            }

            // console.log('UserID:', user.UserID);

            const branches = await branchService.getByOwnerId(user.UserID);
            if (!branches || branches.length === 0) {
                return res.status(404).send("No branches found for this user");
            }
            // console.log('Fetched branches:', branches);
            return res.json(branches);
        }

        return res.status(400).json({ error: 'Please provide a username as a query parameter.' });
    } catch (error) {
        console.error('Error in getByQuery:', error);
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
    getByOwnerId,
    update,
    getByUsername,
    getByQuery
};