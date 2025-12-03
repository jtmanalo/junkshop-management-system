const pool = require('../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM inventory');

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
            if (row.UpdatedAt) {
                row.UpdatedAt = moment(row.UpdatedAt).tz('Asia/Manila').format();
            }
        });

        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getBranchInventory(branchId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM inventory WHERE BranchID = ?',
            [branchId]
        );

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
            if (row.UpdatedAt) {
                row.UpdatedAt = moment(row.UpdatedAt).tz('Asia/Manila').format();
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
            'INSERT INTO inventory (BranchID, Date, CreatedAt) VALUES (?, ?, ?)',
            [
                data.branchId,
                data.date || null,
                createdAt
            ]
        );
        // Return the inserted inventory data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(inventoryId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            'SELECT * FROM inventory WHERE InventoryID = ?',
            [inventoryId]
        );

        if (rows.length === 0) {
            return null; // Inventory not found
        }
        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(inventoryId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const fields = [];
        const values = [];

        if (data.branchId) {
            fields.push('BranchID = ?');
            values.push(data.branchId);
        }
        if (data.date) {
            fields.push('Date = ?');
            values.push(data.date);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE inventory SET ${fields.join(', ')} WHERE InventoryID = ?`;
        values.push(inventoryId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Inventory not found');
        }
        return { id: inventoryId, ...data };
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
    getBranchInventory
};