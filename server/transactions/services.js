const pool = require('../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM transaction');

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.TransactionDate) {
                row.TransactionDate = moment(row.TransactionDate).tz('Asia/Manila').format();
            }
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
        // const transactionDate = moment(data.transactionDate).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const transactionDate = createdAt;

        // Perform the INSERT query
        const result = await conn.query(
            'INSERT INTO transaction (BranchID, BuyerID, SellerID, EmployeeID, UserID, PartyType, TransactionType, TransactionDate, TotalAmount, PaymentMethod, Status, Notes, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.branchId,
                data.buyerId || null,
                data.sellerId || null,
                data.employeeId || null,
                data.userId,
                data.partyType || null,
                data.transactionType,
                transactionDate,
                data.totalAmount || 0,
                data.paymentMethod || 'cash',
                data.status || 'pending',
                data.notes || null,
                createdAt
            ]
        );

        // Return the inserted transaction data
        return { id: result.insertId.toString(), ...data, transactionDate, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(transactionId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM transaction WHERE TransactionID = ?', [transactionId]);

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.TransactionDate) {
                row.TransactionDate = moment(row.TransactionDate).tz('Asia/Manila').format();
            }
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });

        // Return the transaction data
        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(transactionId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const fields = [];
        const values = [];

        if (data.buyerId) {
            fields.push('BuyerID = ?');
            values.push(data.buyerId);
        }
        if (data.sellerId) {
            fields.push('SellerID = ?');
            values.push(data.sellerId);
        }
        if (data.employeeId) {
            fields.push('EmployeeID = ?');
            values.push(data.employeeId);
        }
        if (data.partyType) {
            fields.push('PartyType = ?');
            values.push(data.partyType);
        }
        if (data.transactionDate) {
            fields.push('TransactionDate = ?');
            const formattedDate = moment(data.transactionDate).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
            values.push(formattedDate);
        }
        if (data.totalAmount) {
            fields.push('TotalAmount = ?');
            values.push(data.totalAmount);
        }
        if (data.paymentMethod) {
            fields.push('PaymentMethod = ?');
            values.push(data.paymentMethod);
        }
        if (data.status) {
            fields.push('Status = ?');
            values.push(data.status);
        }
        if (data.notes) {
            fields.push('Notes = ?');
            values.push(data.notes);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE transaction SET ${fields.join(', ')} WHERE TransactionID = ?`;
        values.push(transactionId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Transaction not found');
        }
        return { id: transactionId, ...data };
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