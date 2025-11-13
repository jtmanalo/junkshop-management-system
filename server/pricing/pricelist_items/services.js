const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM pricelist_item');

        // Ensure queryResult is an array
        const resultRows = Array.isArray(rows) ? rows : [rows];

        resultRows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });

        return resultRows;
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
            'INSERT INTO pricelist_item (PriceListID, ItemID, Price, CreatedAt) VALUES (?, ?, ?, ?)',
            [
                data.pricelistId,
                data.itemId,
                data.price,
                createdAt
            ]
        );

        // Return the inserted pricelist item data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(pricelistItemId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            'SELECT * FROM pricelist_item WHERE PriceListItemID = ?',
            [pricelistItemId]
        );
        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(pricelistItemId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const fields = [];
        const values = [];

        if (data.pricelistId) {
            fields.push('PriceListID = ?');
            values.push(data.pricelistId);
        }

        if (data.itemId) {
            fields.push('ItemID = ?');
            values.push(data.itemId);
        }

        if (data.price) {
            fields.push('Price = ?');
            values.push(data.price);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE pricelist_item SET ${fields.join(', ')} WHERE PriceListItemID = ?`;
        values.push(pricelistItemId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Pricelist item not found');
        }
        return { id: pricelistItemId, ...data };
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
