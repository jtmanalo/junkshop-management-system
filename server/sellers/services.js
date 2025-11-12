const pool = require('../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM seller');

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });

        // Return all rows
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
            'INSERT INTO seller (Name, ContactNumber, CreatedAt) VALUES (?, ?, ?)',
            [
                data.name,
                data.contactNumber,
                createdAt
            ]
        );

        // Return the inserted seller data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(sellerId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM seller WHERE SellerID = ?', [sellerId]);
        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(sellerId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Dynamically build the query
        const fields = [];
        const values = [];

        if (data.name) {
            fields.push('Name = ?');
            values.push(data.name);
        }
        if (data.contactNumber) {
            fields.push('ContactNumber = ?');
            values.push(data.contactNumber);
        }

        // If no fields are provided, throw an error
        if (fields.length === 0) {
            throw new Error('No fields provided for update');
        }

        const query = `UPDATE seller SET ${fields.join(', ')} WHERE SellerID = ?`;
        values.push(sellerId);

        const result = await conn.query(query, values);

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            throw new Error('Seller not found');
        }
        return { id: sellerId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function remove(sellerId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query('DELETE FROM seller WHERE SellerID = ?', [sellerId]);
        return result; // Ensure the result object is returned
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
    update,
    remove
};