const pool = require('../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM employee');

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

        // Return the inserted employee data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(employeeId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM employee WHERE EmployeeID = ?', [employeeId]);
        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(employeeId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Dynamically build the query
        const fields = [];
        const values = [];

        if (data.userId) {
            fields.push('UserID = ?');
            values.push(data.userId);
        }
        if (data.positionTitle) {
            fields.push('PositionTitle = ?');
            values.push(data.positionTitle);
        }
        if (data.firstName) {
            fields.push('FirstName = ?');
            values.push(data.firstName);
        }
        if (data.middleName) {
            fields.push('MiddleName = ?');
            values.push(data.middleName);
        }
        if (data.lastName) {
            fields.push('LastName = ?');
            values.push(data.lastName);
        }
        if (data.nickname) {
            fields.push('Nickname = ?');
            values.push(data.nickname);
        }
        if (data.displayPictureURL) {
            fields.push('DisplayPictureURL = ?');
            values.push(data.displayPictureURL);
        }
        if (data.contactNumber) {
            fields.push('ContactNumber = ?');
            values.push(data.contactNumber);
        }
        if (data.address) {
            fields.push('Address = ?');
            values.push(data.address);
        }
        if (data.hireDate) {
            fields.push('HireDate = ?');
            values.push(data.hireDate);
        }
        if (data.status) {
            fields.push('Status = ?');
            values.push(data.status);
        }

        // If no fields are provided, throw an error
        if (fields.length === 0) {
            throw new Error('No fields provided for update');
        }

        const query = `UPDATE employee SET ${fields.join(', ')} WHERE EmployeeID = ?`;
        values.push(employeeId);

        const result = await conn.query(query, values);

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            throw new Error('Employee not found');
        }
        return { id: employeeId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function remove(employeeId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query('DELETE FROM employee WHERE EmployeeID = ?', [employeeId]);
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
    getById,
    update,
    remove
};