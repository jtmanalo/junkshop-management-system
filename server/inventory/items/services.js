const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM item');

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

        // Validate required fields
        if (!data.name || !data.unitOfMeasurement) {
            throw new Error("Missing required fields: 'Name' and 'UnitOfMeasurement' are mandatory.");
        }

        // Debugging: Log the data object
        console.log("Creating item with data:", data);

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Perform the INSERT query 
        const result = await conn.query(
            'INSERT INTO item (Name, UnitOfMeasurement, Classification, Description, CreatedAt) VALUES (?, ?, ?, ?, ?)',
            [
                data.name,
                data.unitOfMeasurement,
                data.classification || null, // Default to null if not provided
                data.description || null,    // Default to null if not provided
                createdAt
            ]
        );

        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        console.error("Error in createItem:", error.message);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(itemId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM item WHERE ItemID = ?', [itemId]);
        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(itemId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const fields = [];
        const values = [];

        if (data.name) {
            fields.push('Name = ?');
            values.push(data.name);
        }

        if (data.unitOfMeasurement) {
            fields.push('UnitOfMeasurement = ?');
            values.push(data.unitOfMeasurement);
        }

        if (data.classification) {
            fields.push('Classification = ?');
            values.push(data.classification);
        }

        if (data.description) {
            fields.push('Description = ?');
            values.push(data.description);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE item SET ${fields.join(', ')} WHERE ItemID = ?`;
        values.push(itemId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Item not found');
        }
        return { id: itemId, ...data };
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
