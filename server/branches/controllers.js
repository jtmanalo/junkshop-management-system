const branchService = require('./services');
const userService = require('../users/services');
const { use } = require('./routes');

// Get all branches
// async function getAll(req, res) {
//     try {
//         const branches = await branchService.getAll();
//         if (branches.length === 0) {
//             return res.status(204).send("No branches found");
//         }
//         res.json(branches);
//     } catch (error) {
//         console.error('Error in getAllBranches:', error);
//         res.status(500).json({ error: error.message });
//     }
// }

// BranchPage create branch for user
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

        console.log('UserID for new branch:', user.UserID);

        // Fetch OwnerID from the owner table
        const owner = await branchService.getOwnerByReferenceId(user.UserID, 'user');
        if (!owner || !owner.OwnerID) {
            console.log('Owner not found, creating new owner.');
            const newOwner = await branchService.addOwner({
                referenceId: user.UserID,
                ownerType: 'user'
            });
            console.log('New owner created:', newOwner);

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

// BranchPage get branches by UserID
// async function getByUserId(req, res) {
//     // console.log("REQ", req.params)
//     const userId = parseInt(req.params.id, 10);
//     // const ownerId = parseInt(req.params.id, 10);
//     // console.log('OwnerID:', ownerId);

//     if (isNaN(userId)) {
//         return res.status(400).json({ error: 'Invalid UserID' });
//     }

//     try {
//         const branch = await branchService.getByUserId(userId);
//         if (!branch) {
//             return res.status(404).send("Branch not found");
//         }
//         res.json(branch);
//     } catch (error) {
//         console.error('Error in getBranchByOwnerId:', error);
//         res.status(500).json({ error: error.message });
//     }
// }

// BranchPage get branches by Username
async function getByUsername(req, res) {
    const { username } = req.params;
    console.log('Passing Username to getByUsername:', username);

    try {
        console.log('Username:', username);
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        // const user = await userService.getByUsername(username);
        // console.log('User fetched for username:', user);
        // if (!user) {
        //     return res.status(404).send("User not found");
        // }

        // console.log('UserID:', user.UserID);

        // if (!user.UserID || isNaN(user.UserID)) {
        //     return res.status(400).json({ error: 'Invalid UserID retrieved for username' });
        // }

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
    // getAll,
    create,
    // getByOwnerId,
    update,
    getByUsername,
    getByQuery,
    createOwner,
    getOwner
};