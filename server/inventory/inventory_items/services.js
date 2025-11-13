const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const queryResult = await conn.query('SELECT * FROM inventory_item');

        // Ensure queryResult is an array
        const rows = Array.isArray(queryResult) ? queryResult : [queryResult];

        rows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });

        return rows;
    }
    catch (error) {
        throw error;
    }
    finally {
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
            'INSERT INTO inventory_item (InventoryID, ItemID, TotalQuantity, CreatedAt) VALUES (?, ?, ?, ?, ?)',
            [
                data.inventoryId,
                data.itemId,
                data.totalQuantity || 0,
                createdAt
            ]
        );

        // Return the inserted inventory item data
        return { id: result.insertId.toString(), ...data, createdAt };
    }
    catch (error) {
        throw error;
    }
    finally {
        if (conn) conn.release();
    }
}

async function getById(inventoryitemId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM inventory_item WHERE InventoryItemID = ?', [inventoryitemId]);

        return rows[0]; // Return the first row if found
    }
    catch (error) {
        throw error;
    }
    finally {
        if (conn) conn.release();
    }
}

async function update(inventoryitemId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Build the SET clause dynamically based on provided data
        const fields = [];
        const values = [];

        if (data.inventoryId) {
            fields.push('InventoryID = ?');
            values.push(data.inventoryId);
        }
        if (data.itemId) {
            fields.push('ItemID = ?');
            values.push(data.itemId);
        }
        if (data.totalQuantity) {
            fields.push('TotalQuantity = ?');
            values.push(data.totalQuantity);
        }
        if (fields.length === 0) {
            // No fields to update
            return;
        }

        // Finalize the query
        const query = `UPDATE inventory_item SET ${fields.join(', ')} WHERE InventoryItemID = ?`;
        values.push(inventoryitemId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Inventory Item not found');
        }
        return { id: inventoryitemId, ...data };
    }
    catch (error) {
        throw error;
    }
    finally {
        if (conn) conn.release();
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update
};