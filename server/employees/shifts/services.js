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

async function create(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        const result = await conn.query(
            'INSERT INTO shift (BranchID, UserID, StartDatetime, EndDatetime, InitialCash, FinalCash, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                data.branchId,
                data.userId,
                data.startDatetime,
                data.endDatetime,
                data.initialCash,
                data.finalCash,
                createdAt
            ]
        );

        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(shiftId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM shift WHERE ShiftID = ?', [shiftId]);

        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getByUserId(userId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM shift WHERE UserID = ?', [userId]);

        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(shiftId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const fields = [];
        const values = [];

        for (const key in data) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
        values.push(shiftId);

        const sql = `UPDATE shift SET ${fields.join(', ')} WHERE ShiftID = ?`;
        await conn.query(sql, values);

        return { id: shiftId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    getAll,
    create,
    getById,
    getByUserId,
    update
};