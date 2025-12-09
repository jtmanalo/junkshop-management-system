const pool = require('../../db');
const moment = require('moment-timezone');

async function getTransactionDate(conn, userId, branchId) {
    try {
        // Get the active shift for the user
        const shift = await conn.query(
            `SELECT StartDatetime FROM shift WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [userId, branchId]
        );

        if (!shift[0]?.StartDatetime) {
            // No active shift, use current date/time
            return moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        }

        const shiftStartDate = moment(shift[0].StartDatetime).tz('Asia/Manila');
        const today = moment().tz('Asia/Manila');

        // If shift start date is today, use current time; otherwise use shift start date with current time
        if (shiftStartDate.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')) {
            // Use current datetime
            return moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        } else {
            // Use shift's start date with current time
            return shiftStartDate.format('YYYY-MM-DD') + ' ' + moment().tz('Asia/Manila').format('HH:mm:ss');
        }
    } catch (error) {
        // Fallback to current time if there's an error
        return moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
    }
}

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM shift');

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.StartDatetime) {
                row.StartDatetime = moment(row.StartDatetime).tz('Asia/Manila').format();
            }
            if (row.EndDatetime) {
                row.EndDatetime = moment(row.EndDatetime).tz('Asia/Manila').format();
            }
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

async function getActivebyUserID(userId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            `SELECT s.*, b.Name, b.Location
             FROM shift s
             JOIN branch b ON s.BranchID = b.BranchID
             WHERE s.UserID = ? AND s.EndDatetime IS NULL`,
            [userId]
        );

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
            if (row.StartDatetime) {
                row.StartDatetime = moment(row.StartDatetime).tz('Asia/Manila').format();
            }
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

        // Check if there's already an active shift for this branch
        const existingShift = await conn.query(
            `SELECT ShiftID FROM shift WHERE BranchID = ? AND EndDatetime IS NULL`,
            [data.branchId]
        );

        if (existingShift.length > 0) {
            throw new Error('An active shift already exists for this branch. Please end the current shift before creating a new one.');
        }

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const startDatetime = moment(data.startDatetime).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        const result = await conn.query(
            `INSERT INTO shift 
            (BranchID, UserID, StartDatetime, 
            InitialCash, RunningTotal, Notes, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.branchId,
                data.userId,
                startDatetime,
                data.initialCash,
                0,
                data.notes,
                createdAt
            ]
        );

        return { id: result.insertId.toString(), ...data, startDatetime, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function endShift(shiftId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const [shift] = await conn.query(
            `SELECT StartDatetime, InitialCash, RunningTotal, AddedCapital FROM shift WHERE ShiftID = ?`,
            [shiftId]
        );

        // console.log('Ending shift with ID:', shiftId, 'Shift data:', shift);

        if (!shift) {
            throw new Error('Shift not found');
        }

        const initialCash = Number(shift.InitialCash) || 0;
        const runningTotal = Number(shift.RunningTotal) || 0;
        const addedCapital = Number(shift.AddedCapital) || 0;
        const shiftStartDate = moment(shift.StartDatetime).tz('Asia/Manila');
        const endDatetime = shiftStartDate.format('YYYY-MM-DD') + ' ' + moment().tz('Asia/Manila').format('HH:mm:ss');

        const finalCash = initialCash + addedCapital - runningTotal;

        const result = await conn.query(
            `UPDATE shift SET EndDatetime = ?, FinalCash = ? WHERE ShiftID = ?`,
            [endDatetime, finalCash, shiftId]
        );

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            throw new Error('Shift not found');
        }
        return { id: shiftId, finalCash, endDatetime };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getBalance(branchId, userId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // console.log('Calculating balance for BranchID:', branchId, 'UserID:', userId);

        // const sale = await conn.query(
        //     `SELECT IFNULL(SUM(TotalAmount), 0) AS TotalSales
        //      FROM transaction
        //      WHERE BranchID = ? AND UserID = ? AND TransactionType = 'sale' 
        //      AND DATE(TransactionDate) = DATE(CONVERT_TZ(NOW(), '+00:00', 'Asia/Manila'));`,
        //     [branchId, userId]
        // );

        // console.log('Total sales fetched:', sale[0].TotalSales);

        // Get ShiftID
        const shift = await conn.query(
            `SELECT ShiftID 
             FROM shift 
             WHERE UserID = ? AND BranchID = ? AND EndDatetime IS NULL`,
            [userId, branchId]
        );

        if (!shift[0]?.ShiftID && data.userType !== 'owner') {
            throw new Error('No active shift found for the user to record the expense.');
        }

        const balance = await conn.query(
            `SELECT InitialCash + COALESCE(AddedCapital, 0) - RunningTotal AS Balance
             FROM shift
             WHERE ShiftID = ?`,
            [shift[0]?.ShiftID]
        );

        // console.log('Shift balance fetched:', balance[0].Balance);

        if (balance.length === 0) {
            return 0;
        }

        return balance[0]?.Balance || 0;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getShiftDetails() {
    let conn;
    try {
        conn = await pool.getConnection();

        const query = `
            SELECT 
                s.*, 
                CONCAT(b.Name, ' - ', b.Location) AS Branch, 
                COALESCE(CONCAT(e.FirstName, ' ', e.LastName), u.Name) AS Name
            FROM 
                shift s
            JOIN 
                branch b 
            ON 
                s.BranchID = b.BranchID
            LEFT JOIN 
                employee e 
            ON 
                s.UserID = e.UserID
            JOIN 
                user u 
            ON 
                s.UserID = u.UserID
            WHERE 
                u.UserType = 'owner' OR e.UserID IS NOT NULL
        `;

        const rows = await conn.query(query);

        rows.forEach(row => {
            if (row.StartDatetime) {
                row.StartDatetime = moment(row.StartDatetime).tz('Asia/Manila').format();
            }
            if (row.EndDatetime) {
                row.EndDatetime = moment(row.EndDatetime).tz('Asia/Manila').format();
            }
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

async function addCapital(shiftId, amount, branchId, userId, notes) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Update shift's AddedCapital
        const result = await conn.query(
            `UPDATE shift 
             SET AddedCapital = COALESCE(AddedCapital, 0) + ? 
             WHERE ShiftID = ?`,
            [amount, shiftId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Shift not found');
        }

        // Create a transaction record for capital injection
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const transactionDate = await getTransactionDate(conn, userId, branchId);

        await conn.query(
            `INSERT INTO transaction 
            (BranchID, UserID, TransactionType, 
            TransactionDate, TotalAmount, 
            PaymentMethod, Status, Notes, CreatedAt, ShiftID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                branchId,
                userId,
                'capital_addition',
                transactionDate,
                amount,
                'cash',
                'completed',
                notes || null,
                createdAt,
                shiftId
            ]
        );

        await conn.commit();
        return { shiftId, addedCapital: amount };
    } catch (error) {
        if (conn) await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    getAll,
    create,
    endShift,
    getActivebyUserID,
    getBalance,
    getShiftDetails,
    addCapital
};