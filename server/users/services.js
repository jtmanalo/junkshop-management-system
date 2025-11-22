const pool = require('../db');
const moment = require('moment-timezone');
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM user');

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
            'INSERT INTO user (Username, PasswordHash, UserType' + (data.email ? ', Email' : '') + ', CreatedAt) VALUES (?, ?, ?' + (data.email ? ', ?' : '') + ', ?)',
            data.email ?
                [
                    data.username,
                    data.passwordHash,
                    data.userType,
                    data.email,
                    createdAt
                ] : [
                    data.username,
                    data.passwordHash,
                    data.userType,
                    createdAt
                ]
        );

        // Return the inserted user data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getByEmail(email) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM user WHERE Email = ?', [email]);
        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getByUsername(username) {
    let conn;
    console.log('Entering getByUsername function');
    console.log('Username parameter:', username);

    try {
        conn = await pool.getConnection();
        console.log('Querying UserID for username:', username); // Debugging
        const rows = await conn.query('SELECT UserID FROM user WHERE Username = ?', [username]);
        console.log('Query result:', rows); // Debugging
        return rows[0]; // Return the first row if found
    } catch (error) {
        console.error('Error during query execution:', error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getUserDetailsByUsername(username) {
    let conn;
    console.log('Entering getUserDetailsByUsername function');
    console.log('Username parameter:', username);

    try {
        conn = await pool.getConnection();
        console.log('Querying UserID and UserType for username:', username); // Debugging
        const rows = await conn.query('SELECT UserID, Username, UserType FROM user WHERE Username = ?', [username]);
        console.log('Query result:', rows); // Debugging
        return rows[0]; // Return the first row if found
    } catch (error) {
        console.error('Error during query execution:', error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(userId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Dynamically build the query
        const fields = [];
        const values = [];

        if (data.username) {
            fields.push('Username = ?');
            values.push(data.username);
        }
        if (data.passwordHash) {
            fields.push('PasswordHash = ?');
            values.push(data.passwordHash);
        }
        if (data.userType) {
            fields.push('UserType = ?');
            values.push(data.userType);
        }

        // If no fields are provided, throw an error
        if (fields.length === 0) {
            throw new Error('No fields provided for update');
        }

        const query = `UPDATE user SET ${fields.join(', ')} WHERE UserID = ?`;
        values.push(userId);

        const result = await conn.query(query, values);

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            throw new Error('User not found');
        }

        return { id: userId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function remove(userId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query('DELETE FROM user WHERE UserID = ?', [userId]);
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
    getByEmail,
    update,
    remove,
    getByUsername,
    getUserDetailsByUsername
};