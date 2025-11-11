const pool = require('../db');

async function getAllUsers() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM user');

        // Return all rows
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function createUser(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the INSERT query
        const result = await conn.query(
            'INSERT INTO user (Username, PasswordHash, UserType' + (data.email ? ', Email' : '') + ') VALUES (?, ?, ?' + (data.email ? ', ?' : '') + ')',
            data.email ? [data.username, data.passwordHash, data.userType, data.email] : [data.username, data.passwordHash, data.userType]
        );

        // Return the inserted user data
        return { id: result.insertId.toString(), ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getUserById(userId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM user WHERE UserID = ?', [userId]);
        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function updateUser(userId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Dynamically build the query
        const fields = [];
        const values = [];

        if (data.username) {
            fields.push('Username = ?');
            values.push(data.username);
        }
        if (data.passwordHash) {
            fields.push('PasswordHash = ?');
            values.push(data.passwordHash);
        }
        if (data.userType) {
            fields.push('UserType = ?');
            values.push(data.userType);
        }

        // If no fields are provided, throw an error
        if (fields.length === 0) {
            throw new Error('No fields provided for update');
        }

        const query = `UPDATE user SET ${fields.join(', ')} WHERE UserID = ?`;
        values.push(userId);

        const result = await conn.query(query, values);

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            throw new Error('User not found');
        }

        return { id: userId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function deleteUser(userId) {
    await pool.query('DELETE FROM user WHERE UserID = ?', [userId]);
}

// CRUD operations for Activity Logs
async function getActivityLogsByUser(userId) {
    const [rows] = await pool.query('SELECT * FROM activity_log WHERE UserID = ?', [userId]);
    return rows;
}

async function createActivityLog(data) {
    const [result] = await pool.query(
        'INSERT INTO activity_log (UserID, BranchID, EntityType, EntityID, ActivityType, Description, LoggedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
            data.userId,
            data.branchId,
            data.entityType,
            data.entityId,
            data.activityType,
            data.description,
            data.loggedAt,
        ]
    );
    return { id: result.insertId, ...data };
}

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getActivityLogsByUser,
    createActivityLog,
};