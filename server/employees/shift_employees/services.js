const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM shift_employee');

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

        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Fetch EmployeeID using firstName and lastName
        const employeeId = await getEmployeeIdByName(data.firstName, data.lastName);

        const result = await conn.query(
            'INSERT INTO shift_employee (ShiftID, EmployeeID, CreatedAt) VALUES (?, ?, ?)',
            [
                data.shiftId,
                employeeId,
                createdAt
            ]
        );
        return { id: result.insertId.toString(), ...data, employeeId, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(shiftId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            `SELECT se.ShiftID, se.EmployeeID, e.FirstName, e.LastName 
             FROM shift_employee se
             JOIN employee e ON se.EmployeeID = e.EmployeeID
             WHERE se.ShiftID = ?`,
            [shiftId]
        );

        if (rows.length === 0) {
            return null;
        }
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(shiftemployeeId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const fields = [];
        const values = [];

        if (data.shiftId) {
            fields.push('ShiftID = ?');
            values.push(data.shiftId);
        }
        if (data.employeeId) {
            fields.push('EmployeeID = ?');
            values.push(data.employeeId);
        }
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE shift_employee SET ${fields.join(', ')} WHERE ShiftEmployeeID = ?`;
        values.push(shiftemployeeId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('ShiftEmployee not found');
        }
        return { id: shiftemployeeId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getEmployeeIdByName(firstName, lastName) {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            'SELECT EmployeeID FROM employee WHERE FirstName = ? AND LastName = ?',
            [firstName, lastName]
        );

        if (rows.length === 0) {
            throw new Error('Employee not found');
        }

        return rows[0].EmployeeID;
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
    getEmployeeIdByName
};