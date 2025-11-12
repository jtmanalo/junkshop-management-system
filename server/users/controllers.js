const userService = require('./services');

// Get all users
async function getAllUsers(req, res) {
    try {
        const users = await userService.getAllUsers();
        if (users.length === 0) {
            return res.status(204).send("No users found");
        }
        res.json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a user
async function createUser(req, res) {
    const { username, passwordHash, userType } = req.body;

    if (!username || !passwordHash || !userType) {
        return res.status(400).json({ error: 'Username, PasswordHash, and UserType are required.' });
    }

    try {
        const user = await userService.createUser({ username, passwordHash, userType });
        res.status(201).json(user);
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get user by ID
async function getUserById(req, res) {
    try {
        const user = await userService.getUserById(parseInt(req.params.id));
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.json(user);
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a user
async function updateUser(req, res) {
    const userId = parseInt(req.params.id, 10);

    try {
        const updatedUser = await userService.updateUser(userId, req.body);
        res.json(updatedUser);
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ error: error.message });
    }
}

// Delete a user
async function deleteUser(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const result = await userService.deleteUser(userId);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
};