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

        const result = await conn.query(
            'INSERT INTO shift_employee (ShiftID, EmployeeID, CreatedAt) VALUES (?, ?, ?)',
            [
                data.shiftId,
                data.employeeId,
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

async function getById(shiftemployeeId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM shift_employee WHERE ShiftEmployeeID = ?', [shiftemployeeId]);

        if (rows.length === 0) {
            return null;
        }
        return rows[0];
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

module.exports = {
    getAll,
    create,
    getById,
    update
};