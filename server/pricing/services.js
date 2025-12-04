const pool = require('../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM pricelist');

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
        const dateEffective = moment(data.dateEffective).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Perform the INSERT query
        const result = await conn.query(
            'INSERT INTO pricelist (BuyerID, BranchID, DateEffective, CreatedAt) VALUES (?, ?, ?, ?)',
            [
                data.buyerId,
                data.branchId,
                dateEffective,
                createdAt
            ]
        );

        // Return the inserted pricelist data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(pricelistId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM pricelist WHERE PriceListID = ?', [pricelistId]);

        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(pricelistId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Build the SET clause dynamically based on provided data
        const fields = [];
        const values = [];

        if (data.buyerId) {
            fields.push('BuyerID = ?');
            values.push(data.buyerId);
        }
        if (data.branchId) {
            fields.push('BranchID = ?');
            values.push(data.branchId);
        }
        if (data.effectiveDate) {
            fields.push('EffectiveDate = ?');
            values.push(data.effectiveDate);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE pricelist SET ${fields.join(', ')} WHERE PriceListID = ?`;
        values.push(pricelistId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Pricelist not found');
        }
        return { id: pricelistId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function createActivityLog(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert LoggedAt to UTC+8 before inserting
        const loggedAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        const result = await conn.query(
            'INSERT INTO activity_log (UserID,' + (data.branchId ? ' BranchID,' : '') + ' ActivityType, Description, LoggedAt) VALUES (?,' + (data.branchId ? '?, ' : '') + '?, ?, ?)',
            data.branchId ?
                [
                    data.userId,
                    data.branchId,
                    data.activityType,
                    data.description,
                    loggedAt,
                ] : [
                    data.userId,
                    data.activityType,
                    data.description,
                    loggedAt,
                ]
        );
        return { id: result.insertId, ...data, loggedAt };
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
    createActivityLog
};