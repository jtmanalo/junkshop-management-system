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
            'INSERT INTO user (Name, Username, PasswordHash, UserType, Status' + (data.email ? ', Email' : '') + ', CreatedAt) VALUES (?, ?, ?, ?' + (data.email ? ', ?' : '') + ', ?, ?)',
            data.email ?
                [
                    data.name,
                    data.username,
                    data.passwordHash,
                    data.userType,
                    data.status,
                    data.email,
                    createdAt
                ] : [
                    data.name,
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

async function getDetails(username) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM user WHERE Username = ?', [username]);

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

async function update(userId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Dynamically build the query
        const userFields = [];
        const userValues = [];
        const employeeFields = [];
        const employeeValues = [];

        if (data.name) {
            userFields.push('Name = ?');
            userValues.push(data.name);
        }
        if (data.username) {
            userFields.push('Username = ?');
            userValues.push(data.username);
        }
        if (data.passwordHash) {
            userFields.push('PasswordHash = ?');
            userValues.push(data.passwordHash);
        }
        if (data.email) {
            userFields.push('Email = ?');
            userValues.push(data.email);
        }
        if (data.branchId) {
            userFields.push('BranchID = ?');
            userValues.push(data.branchId);
        }

        if (data.userType === 'employee') {
            if (data.firstName) {
                employeeFields.push('FirstName = ?');
                employeeValues.push(data.firstName);
            }
            if (data.middleName) {
                employeeFields.push('MiddleName = ?');
                employeeValues.push(data.middleName);
            }
            if (data.lastName) {
                employeeFields.push('LastName = ?');
                employeeValues.push(data.lastName);
            }
            if (data.contactNumber) {
                employeeFields.push('ContactNumber = ?');
                employeeValues.push(data.contactNumber);
            }
            if (data.address) {
                employeeFields.push('Address = ?');
                employeeValues.push(data.address);
            }
        }

        // If no fields are provided, throw an error
        if (userFields.length === 0 && employeeFields.length === 0) {
            throw new Error('No fields provided for update');
        }

        // Update user table
        const query = `UPDATE user SET ${userFields.join(', ')} WHERE UserID = ?`;
        userValues.push(userId);
        const result = await conn.query(query, userValues);

        // Update employee table if userType is employee
        if (data.userType === 'employee' && employeeFields.length > 0) {
            const employeeQuery = `UPDATE employee SET ${employeeFields.join(', ')} WHERE UserID = ?`;
            employeeValues.push(userId);
            await conn.query(employeeQuery, employeeValues);
        }

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

async function approveReject(userId, status) {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'UPDATE user SET Status = ? WHERE UserID = ?',
            [status, userId]
        );

        if (result.affectedRows === 0) {
            throw new Error('User not found');
        }

        return { id: userId, status };
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

async function getUserAndEmployeeDetailsByUsername(username) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Query to get user details and join with employee table
        const rows = await conn.query(`
            SELECT 
                u.*, 
                e.PositionTitle, 
                e.FirstName, 
                e.MiddleName, 
                e.LastName, 
                e.Nickname, 
                e.DisplayPictureURL, 
                e.ContactNumber, 
                e.Address, 
                e.HireDate, 
                e.Status AS EmployeeStatus
            FROM 
                user u
            LEFT JOIN 
                employee e
            ON 
                u.UserID = e.UserID
            WHERE 
                u.Username = ?`, [username]);

        return rows[0]; // Return the first row if found
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

async function getActivityLogs() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(`
            SELECT 
                al.ActivityID,
                u.Username AS User,
                al.ActivityType AS Action,
                al.Description AS Details,
                al.LoggedAt AS Timestamp
            FROM 
                activity_log al
            JOIN 
                user u ON al.UserID = u.UserID
            ORDER BY 
                al.LoggedAt DESC
        `);

        // Format timestamps to UTC+8
        rows.forEach(row => {
            if (row.Timestamp) {
                row.Timestamp = moment(row.Timestamp).tz('Asia/Manila').format();
            }
        });

        return rows;
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
    updateEmployeeStatus,
    getDetails,
    getUserAndEmployeeDetailsByUsername,
    approveReject,
    createActivityLog,
    getActivityLogs,
};