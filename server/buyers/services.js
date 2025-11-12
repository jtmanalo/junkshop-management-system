const pool = require('../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM buyer');

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
            'INSERT INTO buyer (CompanyName, ContactPerson, Notes, Status, CreatedAt) VALUES (?, ?, ?, ?, ?)',
            [
                data.companyName,
                data.contactPerson,
                data.notes || null,
                data.status || 'active',
                createdAt
            ]
        );

        // Return the inserted buyer data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(buyerId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM buyer WHERE BuyerID = ?', [buyerId]);

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });

        // Return the buyer data
        return rows[0] || null;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(buyerId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Build the SET clause dynamically based on provided data
        const fields = [];
        const values = [];

        if (data.companyName) {
            fields.push('CompanyName = ?');
            values.push(data.companyName);
        }
        if (data.contactPerson) {
            fields.push('ContactPerson = ?');
            values.push(data.contactPerson);
        }
        if (data.notes) {
            fields.push('Notes = ?');
            values.push(data.notes);
        }
        if (data.status) {
            fields.push('Status = ?');
            values.push(data.status);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE buyer SET ${fields.join(', ')} WHERE BuyerID = ?`;
        values.push(buyerId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Buyer not found');
        }
        return { id: buyerId, ...data };
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
};