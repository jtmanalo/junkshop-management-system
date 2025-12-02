const pool = require('../../db');
const moment = require('moment-timezone');

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

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const startDatetime = moment(data.startDatetime).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        const result = await conn.query(
            `INSERT INTO shift 
            (BranchID, UserID, StartDatetime, 
            InitialCash, RunningTotal, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.branchId,
                data.userId,
                startDatetime,
                data.initialCash,
                0,
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
            `SELECT InitialCash, RunningTotal FROM shift WHERE ShiftID = ?`,
            [shiftId]
        );

        if (!shift) {
            throw new Error('Shift not found');
        }

        const { InitialCash, RunningTotal } = shift;

        const finalCash = InitialCash - RunningTotal;

        const result = await conn.query(
            `UPDATE shift SET EndDatetime = NOW(), FinalCash = ? WHERE ShiftID = ?`,
            [finalCash, shiftId]

        );

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            throw new Error('Shift not found');
        }
        return { id: shiftId, finalCash, endDatetime: moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss') };
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

        const sale = await conn.query(
            `SELECT IFNULL(SUM(TotalAmount), 0) AS TotalSales
             FROM transaction
             WHERE BranchID = ? AND UserID = ? AND TransactionType = 'sale' 
             AND DATE(TransactionDate) = DATE(CONVERT_TZ(NOW(), '+00:00', 'Asia/Manila'));`,
            [branchId, userId]
        );

        const rows = await conn.query(
            `SELECT InitialCash - RunningTotal AS Balance
             FROM shift
             WHERE BranchID = ? AND UserID = ? AND EndDatetime IS NULL`,
            [branchId, userId]
        );

        if (rows.length === 0) {
            return 0;
        }

        const balance = Number(sale[0].TotalSales) + Number(rows[0].Balance);
        return balance || 0;
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

module.exports = {
    getAll,
    create,
    endShift,
    getActivebyUserID,
    getBalance,
    getShiftDetails
};