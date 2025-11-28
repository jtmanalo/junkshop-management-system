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

async function createRepayment(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const transactionDate = createdAt;

        if (data.totalAmount <= 0) {
            throw new Error('Total amount must be greater than zero for a loan.');
        }
        // Perform the INSERT query
        const result = await conn.query(
            `INSERT INTO transaction 
            (BranchID, SellerID, EmployeeID, UserID, TransactionType, 
            TransactionDate, TotalAmount, 
            PaymentMethod, Status, Notes, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.branchId,
                data.sellerId || null,
                data.employeeId || null,
                data.userId,
                'repayment',
                transactionDate,
                data.totalAmount,
                data.paymentMethod || 'cash',
                data.status || 'completed',
                data.notes || null,
                createdAt
            ]
        );

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [data.userId, data.branchId]
        );

        if (!shift[0]?.ShiftID) {
            throw new Error('No active shift found for the user to record the expense.');
        }

        // Update the RunningTotal for the active shift
        await conn.query(
            `UPDATE shift 
            SET RunningTotal = RunningTotal - ? 
            WHERE ShiftID = ?`,
            [data.totalAmount, shift[0]?.ShiftID]
        );

        // Return the inserted transaction data
        return { id: result.insertId.toString(), ...data, transactionDate, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function createLoan(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const transactionDate = createdAt;

        if (data.totalAmount <= 0) {
            throw new Error('Total amount must be greater than zero for a loan.');
        }
        // Perform the INSERT query
        const result = await conn.query(
            `INSERT INTO transaction 
            (BranchID, SellerID, EmployeeID, UserID, TransactionType, 
            TransactionDate, TotalAmount, 
            PaymentMethod, Status, Notes, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.branchId,
                data.sellerId || null,
                data.employeeId || null,
                data.userId,
                'loan',
                transactionDate,
                data.totalAmount,
                data.paymentMethod || 'cash',
                data.status || 'completed',
                data.notes || null,
                createdAt
            ]
        );

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [data.userId, data.branchId]
        );

        if (!shift[0]?.ShiftID) {
            throw new Error('No active shift found for the user to record the expense.');
        }

        // Update the RunningTotal for the active shift
        await conn.query(
            `UPDATE shift 
            SET RunningTotal = RunningTotal + ? 
            WHERE ShiftID = ?`,
            [data.totalAmount, shift[0]?.ShiftID]
        );

        // Return the inserted transaction data
        return { id: result.insertId.toString(), ...data, transactionDate, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function createExpense(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const transactionDate = createdAt;

        if (data.totalAmount <= 0) {
            throw new Error('Total amount must be greater than zero for an expense.');
        }

        // Perform the INSERT query
        const result = await conn.query(
            `INSERT INTO transaction 
            (BranchID, UserID, TransactionType, 
            TransactionDate, TotalAmount, 
            PaymentMethod, Status, Notes, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.branchId,
                data.userId,
                'expense',
                transactionDate,
                data.totalAmount,
                data.paymentMethod || 'cash',
                data.status || 'completed',
                data.notes || null,
                createdAt
            ]
        );

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [data.userId, data.branchId]
        );

        if (!shift[0]?.ShiftID) {
            throw new Error('No active shift found for the user to record the expense.');
        }

        // Update the RunningTotal for the active shift
        await conn.query(
            `UPDATE shift 
            SET RunningTotal = RunningTotal + ? 
            WHERE ShiftID = ?`,
            [data.totalAmount, shift[0]?.ShiftID]
        );

        // Return the inserted transaction data
        return { id: result.insertId.toString(), ...data, transactionDate, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getExpenseBalance(branchId, userID) {
    let conn;
    try {
        conn = await pool.getConnection();

        const [balance] = await conn.query(
            `SELECT SUM(TotalAmount) AS TotalExpenses
                FROM transaction
                WHERE TransactionType = 'expense'
                AND BranchID = ?
                AND UserID = ?
                AND DATE(TransactionDate) = DATE(CONVERT_TZ(NOW(), '+00:00', 'Asia/Manila'));`,
            [branchId, userID]
        );

        return balance ? balance.TotalExpenses || 0 : 0;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getSaleBalance(branchId, userID) {
    let conn;
    try {
        conn = await pool.getConnection();

        const [balance] = await conn.query(
            `SELECT SUM(TotalAmount) AS TotalSales
                FROM transaction
                WHERE TransactionType = 'sale'
                AND BranchID = ?
                AND UserID = ?
                AND DATE(TransactionDate) = DATE(CONVERT_TZ(NOW(), '+00:00', 'Asia/Manila'));`,
            [branchId, userID]
        );

        return balance ? balance.TotalSales || 0 : 0;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getPurchaseBalance(branchId, userID) {
    let conn;
    try {
        conn = await pool.getConnection();

        const [balance] = await conn.query(
            `SELECT SUM(TotalAmount) AS TotalPurchases
                FROM transaction
                WHERE TransactionType = 'purchase'
                AND BranchID = ?
                AND UserID = ?
                AND DATE(TransactionDate) = DATE(CONVERT_TZ(NOW(), '+00:00', 'Asia/Manila'));`,
            [branchId, userID]
        );

        return balance ? balance.TotalPurchases || 0 : 0;
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
    update,
    createExpense,
    getExpenseBalance,
    getSaleBalance,
    getPurchaseBalance,
    createLoan,
    createRepayment,
    // createPurchase,
    // createSale
};