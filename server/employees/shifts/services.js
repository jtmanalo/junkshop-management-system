const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM shift');

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.StartDatetime) {
                row.StartDatetime = moment(row.StartDatetime).tz('Asia/Manila').format();
            }
            if (row.EndDatetime) {
                row.EndDatetime = moment(row.EndDatetime).tz('Asia/Manila').format();
            }
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getActivebyUserID(userId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            `SELECT s.*, b.Name, b.Location
             FROM shift s
             JOIN branch b ON s.BranchID = b.BranchID
             WHERE s.UserID = ? AND s.EndDatetime IS NULL`,
            [userId]
        );

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.StartDatetime) {
                row.StartDatetime = moment(row.StartDatetime).tz('Asia/Manila').format();
            }
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function create(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const startDatetime = moment(data.startDatetime).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        const result = await conn.query(
            `INSERT INTO shift 
            (BranchID, UserID, StartDatetime, 
            InitialCash, CreatedAt) VALUES (?, ?, ?, ?, ?)`,
            [
                data.branchId,
                data.userId,
                startDatetime,
                data.initialCash,
                createdAt
            ]
        );

        return { id: result.insertId.toString(), ...data, startDatetime, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function endShift(shiftId, finalCash) {
    let conn;
    try {
        conn = await pool.getConnection();

        if (!finalCash) {
            throw new Error('FinalCash is required to end the shift');
        }

        const query = `UPDATE shift SET EndDatetime = NOW(), FinalCash = ? WHERE ShiftID = ?`;
        const values = [finalCash, shiftId];

        const result = await conn.query(query, values);

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            throw new Error('Shift not found');
        }
        return { id: shiftId, finalCash, endDatetime: moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss') };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    getAll,
    create,
    endShift,
    getActivebyUserID
};