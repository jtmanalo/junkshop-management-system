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

async function getSellerLoans() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query(`
            SELECT 
                s.SellerID,
                s.Name,
                s.ContactNumber,
                s.CreatedAt,
                COALESCE(SUM(CASE WHEN t.TransactionType = 'loan' THEN t.TotalAmount ELSE 0 END), 0) AS LoanAmount,
                COALESCE(SUM(CASE WHEN t.TransactionType = 'repayment' THEN t.TotalAmount ELSE 0 END), 0) AS RepaymentAmount,
                COALESCE(SUM(CASE WHEN t.TransactionType = 'loan' THEN t.TotalAmount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN t.TransactionType = 'repayment' THEN t.TotalAmount ELSE 0 END), 0) AS OutstandingBalance,
                COALESCE(MAX(t.TransactionDate), 'N/A') AS LastTransactionDate
            FROM 
                seller s
            LEFT JOIN 
                transaction t ON t.SellerID = s.SellerID AND t.TransactionType IN ('loan', 'repayment')
            GROUP BY 
                s.SellerID, s.Name, s.ContactNumber, s.CreatedAt`
        );

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.TransactionDate) {
                row.TransactionDate = moment(row.TransactionDate).tz('Asia/Manila').format();
            }
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
            }
        });

        // Return all rows
        return rows;
    }
    catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getEmployeeLoans() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query(`
            SELECT 
                e.EmployeeID,
                CONCAT(e.FirstName, ' ', COALESCE(e.MiddleName, ''), ' ', e.LastName) AS Name,
                e.PositionTitle,
                e.Nickname,
                e.ContactNumber,
                e.Address,
                e.HireDate,
                e.Status,
                e.CreatedAt,
                SUM(CASE WHEN t.TransactionType = 'loan' THEN t.TotalAmount ELSE 0 END) AS LoanAmount,
                SUM(CASE WHEN t.TransactionType = 'repayment' THEN t.TotalAmount ELSE 0 END) AS RepaymentAmount,
                SUM(CASE WHEN t.TransactionType = 'loan' THEN t.TotalAmount ELSE 0 END) - 
                SUM(CASE WHEN t.TransactionType = 'repayment' THEN t.TotalAmount ELSE 0 END) AS OutstandingBalance,
                COALESCE(MAX(t.TransactionDate), 'N/A') AS LastTransactionDate
            FROM 
                employee e
            LEFT JOIN 
                transaction t ON t.EmployeeID = e.EmployeeID AND t.TransactionType IN ('loan', 'repayment')
            WHERE 
                e.EmployeeID IS NOT NULL
            GROUP BY 
                e.EmployeeID, e.FirstName, e.MiddleName, e.LastName, e.PositionTitle, e.Nickname, e.ContactNumber, e.Address, e.HireDate, e.Status, e.CreatedAt;`
        );

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.TransactionDate) {
                row.TransactionDate = moment(row.TransactionDate).tz('Asia/Manila').format();
            }
            // Ensures timestamps are in readable format (YYYY-MM-DD HH:mm:ss)
            if (row.HireDate) {
                row.HireDate = moment(row.HireDate).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
            }
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
            }
        });

        // Return all rows
        return rows;
    }
    catch (error) {
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

        let sellerId = null;
        let employeeId = null;

        // Fetch the SellerID or EmployeeID based on the role
        if (data.partyType === 'employee') {
            const employeeResult = await conn.query(
                `SELECT EmployeeID FROM employee WHERE CONCAT(FirstName, ' ', LastName) = ?`,
                [data.name]
            );
            if (employeeResult.length > 0) {
                employeeId = employeeResult[0].EmployeeID;
            } else {
                throw new Error(`Employee not found with name: ${data.name}`);
            }
        } else if (data.partyType === 'seller') {
            const sellerResult = await conn.query(
                `SELECT SellerID FROM seller WHERE Name = ?`,
                [data.name]
            );
            if (sellerResult.length > 0) {
                sellerId = sellerResult[0].SellerID;
            } else {
                throw new Error(`Seller not found with name: ${data.name}`);
            }
        } else {
            throw new Error('Invalid role specified. Role must be either "employee" or "seller".');
        }

        console.log('Fetched party data:', { sellerId, employeeId });

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const transactionDate = createdAt;

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [data.userId, data.branchId]
        );

        if (!shift[0]?.ShiftID && data.userType !== 'owner') {
            throw new Error('No active shift found for the user to record the expense.');
        }

        if (data.totalAmount <= 0) {
            throw new Error('Total amount must be greater than zero for a loan.');
        }

        // Perform the INSERT query
        const result = await conn.query(
            `INSERT INTO transaction 
            (BranchID, SellerID, EmployeeID, UserID, TransactionType, 
            TransactionDate, TotalAmount, 
            PaymentMethod, Status, Notes, CreatedAt, ShiftID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.branchId,
                sellerId,
                employeeId,
                data.userId,
                'repayment',
                transactionDate,
                data.totalAmount,
                data.paymentMethod || 'cash',
                data.status || 'completed',
                data.notes || null,
                createdAt,
                shift[0]?.ShiftID
            ]
        );

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
        console.log('Creating loan with data:', data);

        let sellerId = null;
        let employeeId = null;

        // Fetch the SellerID or EmployeeID based on the role
        if (data.partyType === 'employee') {
            const employeeResult = await conn.query(
                `SELECT EmployeeID FROM employee WHERE CONCAT(FirstName, ' ', LastName) = ?`,
                [data.name]
            );
            if (employeeResult.length > 0) {
                employeeId = employeeResult[0].EmployeeID;
            } else {
                throw new Error(`Employee not found with name: ${data.name}`);
            }
        } else if (data.partyType === 'seller') {
            const sellerResult = await conn.query(
                `SELECT SellerID FROM seller WHERE Name = ?`,
                [data.name]
            );
            if (sellerResult.length > 0) {
                sellerId = sellerResult[0].SellerID;
            } else {
                throw new Error(`Seller not found with name: ${data.name}`);
            }
        } else {
            throw new Error('Invalid role specified. Role must be either "employee" or "seller".');
        }

        console.log('Fetched party data:', { sellerId, employeeId });

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const transactionDate = createdAt;

        console.log('UserID:', data.userId, 'BranchID:', data.branchId);
        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [data.userId, data.branchId]
        );
        console.log('Active shift query result:', shift[0]?.ShiftID);

        if (!shift[0]?.ShiftID && data.userType !== 'owner') {
            throw new Error('No active shift found for the user to record the expense.');
        }


        if (data.totalAmount <= 0) {
            throw new Error('Total amount must be greater than zero for a loan.');
        }
        // Perform the INSERT query
        const result = await conn.query(
            `INSERT INTO transaction 
            (BranchID, SellerID, EmployeeID, UserID, TransactionType, 
            TransactionDate, TotalAmount, 
            PaymentMethod, Status, Notes, CreatedAt, ShiftID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.branchId,
                sellerId,
                employeeId,
                data.userId,
                'loan',
                transactionDate,
                data.totalAmount,
                data.paymentMethod || 'cash',
                data.status || 'completed',
                data.notes || null,
                createdAt,
                shift[0]?.ShiftID
            ]
        );

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

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [data.userId, data.branchId]
        );

        console.log('UserID:', data.userId, 'BranchID:', data.branchId);

        console.log('Active shift query result:', shift[0]?.ShiftID);

        if (!shift[0]?.ShiftID && data.userType !== 'owner') {
            throw new Error('No active shift found for the user to record the expense.');
        }

        // Perform the INSERT query
        const result = await conn.query(
            `INSERT INTO transaction 
            (BranchID, UserID, TransactionType, 
            TransactionDate, TotalAmount, 
            PaymentMethod, Status, Notes, CreatedAt, ShiftID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.branchId,
                data.userId,
                'expense',
                transactionDate,
                data.totalAmount,
                data.paymentMethod || 'cash',
                data.status || 'completed',
                data.notes || null,
                createdAt,
                shift[0]?.ShiftID
            ]
        );

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

async function getExpenseBalance(branchId, userID,) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Get ShiftID
        console.log('UserID:', userID, 'BranchID:', branchId);
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [userID, branchId]
        );

        console.log('UserID:', userID, 'BranchID:', branchId);

        console.log('Active shift query result:', shift[0]?.ShiftID);

        const [balance] = await conn.query(
            `SELECT SUM(TotalAmount) AS TotalExpenses
                FROM transaction
                WHERE TransactionType = 'expense'
                AND BranchID = ?
                AND UserID = ?
                AND ShiftID = ?`,
            [branchId, userID, shift[0]?.ShiftID]
        );
        //AND DATE(TransactionDate) = DATE(CONVERT_TZ(NOW(), '+00:00', 'Asia/Manila'));
        return balance ? balance.TotalExpenses || 0 : 0;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getBalance(branchId, userID) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [data.userId, data.branchId]
        );

        console.log('UserID:', data.userId, 'BranchID:', data.branchId);

        console.log('Active shift query result:', shift[0]?.ShiftID);

        const [balance] = await conn.query(
            `SELECT (InitialCash - RunningTotal) AS Balance
                FROM shift
                WHERE
                BranchID = ?
                AND UserID = ?
                AND ShiftID = ?`,
            [branchId, userID, shift[0]?.ShiftID]
        );

        return balance ? balance.TotalSales || 0 : 0;
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

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [userID, branchId]
        );

        console.log('UserID:', userID, 'BranchID:', branchId);

        console.log('Active shift query result:', shift[0]?.ShiftID);

        const [balance] = await conn.query(
            `SELECT SUM(TotalAmount) AS TotalSales
                FROM transaction
                WHERE TransactionType = 'sale'
                AND BranchID = ?
                AND UserID = ?
                AND ShiftID = ?`,
            [branchId, userID, shift[0]?.ShiftID]
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

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [userID, branchId]
        );

        console.log('UserID:', userID, 'BranchID:', branchId);

        console.log('Active shift query result:', shift[0]?.ShiftID);

        const [balance] = await conn.query(
            `SELECT SUM(TotalAmount) AS TotalPurchases
                FROM transaction
                WHERE TransactionType = 'purchase'
                AND BranchID = ?
                AND UserID = ?
                AND ShiftID = ?`,
            [branchId, userID, shift[0]?.ShiftID]
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

async function createPurchase(data) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const transactionDate = createdAt;

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [data.userId, data.branchId]
        );

        if (!shift[0]?.ShiftID && data.userType !== 'owner') {
            throw new Error('No active shift found for the user to record the expense.');
        }

        // Insert into transaction table
        const transactionResult = await conn.query(
            `INSERT INTO transaction 
            (BranchID, 
            SellerID, 
            UserID, 
            PartyType, 
            TransactionType, 
            TransactionDate, 
            PaymentMethod, Status, Notes, TotalAmount, CreatedAt, ShiftID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.branchId,
                data.sellerId,
                data.userId,
                data.partyType,
                'purchase',
                transactionDate,
                data.paymentMethod,
                data.status,
                data.notes,
                data.totalAmount,
                createdAt,
                shift[0]?.ShiftID
            ]
        );
        const transactionId = transactionResult.insertId;

        // Insert into transaction_item table
        for (const item of data.items) {
            await conn.query(
                'INSERT INTO transaction_item (TransactionID, ItemID, Quantity, Price, Subtotal, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                [transactionId, item.itemId, item.quantity, item.itemPrice, item.subtotal, createdAt]
            );
        }

        // Insert into weighing_log table
        for (const item of data.items) {
            await conn.query(
                'INSERT INTO weighing_log (ItemID, BranchID, TransactionID, Weight, UserID, WeighedAt) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    item.itemId,
                    data.branchId,
                    transactionId,
                    item.quantity,
                    data.userId,
                    transactionDate,
                ]
            );
        }

        await conn.query(
            `UPDATE shift 
            SET RunningTotal = RunningTotal + ? 
            WHERE ShiftID = ?`,
            [data.totalAmount, shift[0]?.ShiftID]
        );

        await conn.commit();
        return { id: transactionResult.insertId, ...data };
    } catch (error) {
        if (conn) await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.release();
    }
}


async function createSale(data) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const transactionDate = createdAt;

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [data.userId, data.branchId]
        );

        if (!shift[0]?.ShiftID && data.userType !== 'owner') {
            throw new Error('No active shift found for the user to record the expense.');
        }

        // Insert into transaction table
        const transactionResult = await conn.query(
            `INSERT INTO transaction 
            (BranchID, 
            BuyerID, 
            UserID, 
            PartyType, 
            TransactionType, 
            TransactionDate, 
            PaymentMethod, Status, Notes, TotalAmount, CreatedAt, ShiftID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.branchId,
                data.buyerId,
                data.userId,
                data.partyType,
                'sale',
                transactionDate,
                data.paymentMethod,
                data.status,
                data.notes,
                data.totalAmount,
                createdAt,
                shift[0]?.ShiftID
            ]
        );
        const transactionId = transactionResult.insertId;

        // Insert into transaction_item table
        for (const item of data.items) {
            await conn.query(
                'INSERT INTO transaction_item (TransactionID, ItemID, Quantity, Price, Subtotal, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                [transactionId, item.itemId, item.quantity, item.itemPrice, item.subtotal, createdAt]
            );
        }

        // Insert into weighing_log table
        for (const item of data.items) {
            await conn.query(
                'INSERT INTO weighing_log (ItemID, BranchID, TransactionID, Weight, UserID, WeighedAt) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    item.itemId,
                    data.branchId,
                    transactionId,
                    item.quantity,
                    data.userId,
                    transactionDate,
                ]
            );
        }

        await conn.query(
            `UPDATE shift 
            SET RunningTotal = RunningTotal - ? 
            WHERE ShiftID = ?`,
            [data.totalAmount, shift[0]?.ShiftID]
        );

        await conn.commit();
        return { id: transactionResult.insertId, ...data };
    } catch (error) {
        if (conn) await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getDailyLogs(shiftId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query(`SELECT * FROM transaction WHERE ShiftID = ? AND Status = "completed"`, [shiftId]);

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.Time) {
                row.Time = moment(row.Time).tz('Asia/Manila').format();
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
    getEmployeeLoans,
    getSellerLoans,
    createPurchase,
    createSale,
    getDailyLogs,
    getBalance
};