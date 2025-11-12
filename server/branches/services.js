const pool = require('../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM branch');

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
            if (row.OpeningDate) {
                row.OpeningDate = moment(row.OpeningDate).tz('Asia/Manila').format('YYYY-MM-DD');
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
            'INSERT INTO branch (Name, Location, Status, OpeningDate, CreatedAt) VALUES (?, ?, ?, ?, ?)',
            [
                data.name,
                data.location,
                data.status || 'active',
                data.openingDate,
                createdAt
            ]
        );

        // Return the inserted branch data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(branchId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM branch WHERE BranchID = ?', [branchId]);
        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(branchId, data) {
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
        if (data.location) {
            fields.push('Location = ?');
            values.push(data.location);
        }
        if (data.status) {
            fields.push('Status = ?');
            values.push(data.status);
        }
        // should not be updated at all
        // if (data.openingDate) {
        //     fields.push('OpeningDate = ?');
        //     values.push(data.openingDate);
        // }

        // If no fields are provided, throw an error
        if (fields.length === 0) {
            throw new Error('No fields provided for update');
        }

        const query = `UPDATE branch SET ${fields.join(', ')} WHERE BranchID = ?`;
        values.push(branchId);

        const result = await conn.query(query, values);

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            throw new Error('Branch not found');
        }
        return { id: branchId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

// update status instead of delete
// async function remove(branchId) {
//     let conn;
//     try {
//         conn = await pool.getConnection();
//         const result = await conn.query('DELETE FROM branch WHERE BranchID = ?', [branchId]);
//         return result; // Ensure the result object is returned
//     } catch (error) {
//         throw error;
//     } finally {
//         if (conn) conn.release();
//     }
// }

module.exports = {
    getAll,
    create,
    getById,
    update
    // remove
};