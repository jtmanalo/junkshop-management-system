const pool = require('../db');
const moment = require('moment-timezone');

async function getActivityLogsByUser(userId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.query('SELECT * FROM activity_log WHERE UserID = ?', [userId]);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function createActivityLog(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert LoggedAt to UTC+8 before inserting
        const loggedAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        const [result] = await conn.query(
            'INSERT INTO activity_log (UserID, BranchID, EntityType, EntityID, ActivityType, Description, LoggedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                data.userId,
                data.branchId,
                data.entityType,
                data.entityId,
                data.activityType,
                data.description,
                loggedAt,
            ]
        );
        return { id: result.insertId, ...data, loggedAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    getActivityLogsByUser,
    createActivityLog,
};