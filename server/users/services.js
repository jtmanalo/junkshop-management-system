const pool = require('../db');
const moment = require('moment-timezone');
const axios = require('axios');

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

// LoginRegisterPage create new user
async function createUser(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Perform the INSERT query
        const result = await conn.query(
            'INSERT INTO user (Username, PasswordHash, UserType, Status' + (data.email ? ', Email' : '') + ', CreatedAt) VALUES (?, ?, ?, ?' + (data.email ? ', ?' : '') + ', ?)',
            data.email ?
                [
                    data.username,
                    data.passwordHash,
                    data.userType,
                    data.status,
                    data.email,
                    createdAt
                ] : [
                    data.username,
                    data.passwordHash,
                    data.userType,
                    data.status,
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
        const rows = await conn.query(`
            SELECT 
                u.*, 
                b.Name AS BranchName,
                b.Location AS BranchLocation
            FROM 
                user u
            LEFT JOIN
                branch b
            ON
                u.BranchID = b.BranchID
            WHERE
                u.Email = ?`, [email]);
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
        console.log('Query result:', rows[0]); // Debugging
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
        if (data.status) {
            fields.push('Status = ?');
            values.push(data.status);
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

async function createEmployee(data) {
    let conn;
    try {
        conn = await pool.getConnection();
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        const result = await conn.query(
            'INSERT INTO employee (UserID, PositionTitle, FirstName, MiddleName, LastName, Nickname, DisplayPictureURL, ContactNumber, Address, HireDate, Status, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.userId,
                data.positionTitle,
                data.firstName,
                data.middleName,
                data.lastName,
                data.nickname,
                data.displayPictureURL,
                data.contactNumber,
                data.address,
                data.hireDate,
                data.status || 'active',
                createdAt
            ]
        );

        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function createOwner(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const result = await conn.query(
            'INSERT INTO owner (OwnerType, ReferenceID) VALUES (?, ?)',
            [
                data.ownerType,
                data.referenceId
            ]
        );

        return { id: result.insertId.toString(), ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function updateEmployeeStatus(userId, status) {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'UPDATE employee SET Status = ? WHERE UserID = ?',
            [status, userId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Employee not found');
        }

        return { id: userId, status };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    getAll,
    createUser,
    getByEmail,
    update,
    remove,
    getByUsername,
    getUserDetailsByUsername,
    createEmployee,
    createOwner,
    updateEmployeeStatus
};