const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM weighing_log');

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.WeighedAt) {
                row.WeighedAt = moment(row.WeighedAt).tz('Asia/Manila').format();
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

        // Validate required fields
        if (!data.itemId || !data.branchId || !data.transactionId || !data.weight || !data.userId) {
            throw new Error("Missing required fields: 'ItemID', 'Weight', and 'UserID' are mandatory.");
        }
        // Convert timestamps to MariaDB-compatible format
        const weighedAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Perform the INSERT query 
        const result = await conn.query(
            'INSERT INTO weighing_log (ItemID, BranchID, TransactionID, Weight, UserID, WeighedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [
                data.itemId,
                data.branchId,
                data.transactionId,
                data.weight,
                data.userId,
                weighedAt
            ]
        );

        return { id: result.insertId.toString(), ...data, weighedAt };
    } catch (error) {
        console.error("Error in createWeighingLog:", error.message);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(weighinglogId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM weighing_log WHERE LogID = ?', [weighinglogId]);

        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(weighinglogId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Dynamically build the query
        const fields = [];
        const values = [];

        if (data.itemId) {
            fields.push('ItemID = ?');
            values.push(data.itemId);
        }
        if (data.branchId) {
            fields.push('BranchID = ?');
            values.push(data.branchId);
        }
        if (data.transactionId) {
            fields.push('TransactionID = ?');
            values.push(data.transactionId);
        }
        if (data.weight) {
            fields.push('Weight = ?');
            values.push(data.weight);
        }
        if (data.userId) {
            fields.push('UserID = ?');
            values.push(data.userId);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update.");
        }

        const query = `UPDATE weighing_log SET ${fields.join(', ')} WHERE LogID = ?`;
        values.push(weighinglogId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Weighing log not found.");
        }
        return { id: weighinglogId, ...data };
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
    update
};