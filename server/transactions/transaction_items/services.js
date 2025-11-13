const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM transaction_item');

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
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

        // Perform the INSERT query
        const result = await conn.query(
            'INSERT INTO transaction_item (TransactionID, ItemID, Quantity, Price, Subtotal, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [
                data.transactionId,
                data.itemId,
                data.quantity,
                data.price,
                data.subtotal,
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

async function getById(transactionitemId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM transaction_item WHERE TransactionItemID = ?', [transactionitemId]);

        if (rows.length === 0) {
            return null; // No transaction item found with the given ID
        }

        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(transactionitemId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const fields = [];
        const values = [];

        if (data.transactionId) {
            fields.push('TransactionID = ?');
            values.push(data.transactionId);
        }

        if (data.itemId) {
            fields.push('ItemID = ?');
            values.push(data.itemId);
        }

        if (data.quantity) {
            fields.push('Quantity = ?');
            values.push(data.quantity);
        }

        if (data.price) {
            fields.push('Price = ?');
            values.push(data.price);
        }

        if (data.subtotal) {
            fields.push('Subtotal = ?');
            values.push(data.subtotal);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE transaction_item SET ${fields.join(', ')} WHERE TransactionItemID = ?`;
        values.push(transactionitemId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Transaction item not found');
        }

        return { id: transactionitemId, ...data };
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