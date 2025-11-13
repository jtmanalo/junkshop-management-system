const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM counting_log');

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.CountedAt) {
                row.CountedAt = moment(row.CountedAt).tz('Asia/Manila').format();
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
        if (!data.itemId || !data.branchId || !data.transactionId || !data.countedQuantity || !data.userId) {
            throw new Error("Missing required fields: 'ItemID', 'CountedQuantity', and 'UserID' are mandatory.");
        }
        // Convert timestamps to MariaDB-compatible format
        const countedAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Perform the INSERT query 
        const result = await conn.query(
            'INSERT INTO counting_log (ItemID, BranchID, TransactionID, CountedQuantity, UserID, CountedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [
                data.itemId,
                data.branchId,
                data.transactionId,
                data.countedQuantity,
                data.userId,
                countedAt
            ]
        );

        return { id: result.insertId.toString(), ...data, countedAt };
    } catch (error) {
        console.error("Error in createCountingLog:", error.message);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(countinglogId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM counting_log WHERE LogID = ?', [countinglogId]);

        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(countinglogId, data) {
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
        if (data.countedQuantity) {
            fields.push('CountedQuantity = ?');
            values.push(data.countedQuantity);
        }
        if (data.userId) {
            fields.push('UserID = ?');
            values.push(data.userId);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update.");
        }

        const query = `UPDATE counting_log SET ${fields.join(', ')} WHERE LogID = ?`;
        values.push(countinglogId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Counting log not found.");
        }
        return { id: countinglogId, ...data };
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