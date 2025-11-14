const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM pricelist_activity');

        // Ensure timestamps are in UTC+8
        rows.forEach(row => {
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

        // Convert UpdatedAt to UTC+8 before inserting
        const updatedAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        const result = await conn.query(
            'INSERT INTO pricelist_activity (PricelistID, UserID, OldPrice, NewPrice, UpdatedAt) VALUES (?, ?, ?, ?, ?)',
            [
                data.pricelistId,
                data.userId,
                data.oldPrice,
                data.newPrice,
                updatedAt
            ]
        );
        return { id: result.insertId, ...data, updatedAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(pricelistactivityId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM pricelist_activity WHERE PricelistActivityID = ?', [pricelistactivityId]);
        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(pricelistactivityId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const fields = [];
        const values = [];

        if (data.pricelistId) {
            fields.push('PricelistID = ?');
            values.push(data.pricelistId);
        }
        if (data.userId) {
            fields.push('UserID = ?');
            values.push(data.userId);
        }
        if (data.oldPrice) {
            fields.push('OldPrice = ?');
            values.push(data.oldPrice);
        }
        if (data.newPrice) {
            fields.push('NewPrice = ?');
            values.push(data.newPrice);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE pricelist_activity SET ${fields.join(', ')} WHERE PricelistActivityID = ?`;
        values.push(pricelistactivityId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Pricelist Activity not found');
        }
        return { id: pricelistactivityId, ...data };
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