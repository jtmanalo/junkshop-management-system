const pool = require('../db');

// CRUD operations for Users
// async function getAllUsers() {
//     const [rows] = await pool.query('SELECT * FROM user');
//     return rows;
// }
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


// async function createUser(data) {
//     const result = await pool.query(
//         'INSERT INTO user (Username, PasswordHash, UserType' + (data.email ? ', Email' : '') + ') VALUES (?, ?, ?' + (data.email ? ', ?' : '') + ')',
//         data.email ? [data.username, data.passwordHash, data.userType, data.email] : [data.username, data.passwordHash, data.userType]
//     );

//     // Check if result is iterable or contains the expected structure
//     if (result && result.insertId) {
//         return { id: result.insertId, ...data };
//     } else {
//         throw new Error('Failed to insert user');
//     }
// }

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
        return { id: result.insertId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getUserById(userId) {
    const [rows] = await pool.query('SELECT * FROM user WHERE UserID = ?', [userId]);
    return rows[0];
}

async function updateUser(userId, data) {
    const query = 'UPDATE user SET Username = ?, PasswordHash = ?, UserType = ?' + (data.email ? ', Email = ?' : '') + ' WHERE UserID = ?';
    const params = data.email
        ? [data.username, data.passwordHash, data.userType, data.email, userId]
        : [data.username, data.passwordHash, data.userType, userId];

    await pool.query(query, params);
    return { id: userId, ...data };
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