const pool = require('../db');
const moment = require('moment-timezone');

// async function getAll() {
//     let conn;
//     try {
//         conn = await pool.getConnection();

//         // Perform the SELECT query
//         const rows = await conn.query('SELECT * FROM branch');

//         // Ensures timestamps are in UTC+8
//         rows.forEach(row => {
//             if (row.CreatedAt) {
//                 row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
//             }
//             if (row.OpeningDate) {
//                 row.OpeningDate = moment(row.OpeningDate).tz('Asia/Manila').format('YYYY-MM-DD');
//             }
//         });

//         // Return all rows
//         return rows;
//     } catch (error) {
//         throw error;
//     } finally {
//         if (conn) conn.release();
//     }
// }

async function create(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Perform the INSERT query
        const result = await conn.query(
            'INSERT INTO branch (Name, Location, Status, OpeningDate, CreatedAt, OwnerID) VALUES (?, ?, ?, ?, ?, ?)',
            [
                data.name,
                data.location,
                data.status || 'active',
                data.openingDate,
                createdAt,
                data.ownerId // Added OwnerID field
            ]
        );

        // Return the inserted branch data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getByOwnerId(ownerId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM branch WHERE OwnerID = ?', [ownerId]);
        return rows; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getByUsername(username) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Fetch UserID for the given username
        const user = await conn.query('SELECT UserID FROM user WHERE Username = ?', [username]);
        if (!user[0]) {
            throw new Error('User not found');
        }

        const userId = user[0].UserID; // Assign the UserID to userId
        console.log('Retrieved UserID for username', username, ':', userId);

        // Fetch branches for the UserID
        const rows = await conn.query(
            `SELECT b.*
             FROM branch b
             JOIN owner o ON b.OwnerID = o.OwnerID
             WHERE o.ReferenceID = ?`,
            [userId]
        );
        console.log('Branches fetched for UserID', userId, ':', rows);
        return rows; // Return all branches for the given username
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getOwnerByReferenceId(referenceId, ownerType) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM owner WHERE ReferenceID = ? AND OwnerType = ?',
            [referenceId, ownerType]
        );
        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function addOwner(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the INSERT query
        const result = await conn.query(
            'INSERT INTO owner (OwnerType, ReferenceID) VALUES (?, ?)',
            [
                data.ownerType,
                data.referenceId
            ]
        );

        // Return the inserted owner data
        return { id: result.insertId.toString(), ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getOwner(referenceId, ownerType) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            'SELECT * FROM owner WHERE ReferenceID = ? AND OwnerType = ?',
            [referenceId, ownerType]
        );
        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(branchId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Dynamically build the query
        const fields = [];
        const values = [];

        if (data.name) {
            fields.push('Name = ?');
            values.push(data.name);
        }
        if (data.location) {
            fields.push('Location = ?');
            values.push(data.location);
        }
        if (data.status) {
            fields.push('Status = ?');
            values.push(data.status);
        }
        // should not be updated at all
        // if (data.openingDate) {
        //     fields.push('OpeningDate = ?');
        //     values.push(data.openingDate);
        // }

        // If no fields are provided, throw an error
        if (fields.length === 0) {
            throw new Error('No fields provided for update');
        }

        const query = `UPDATE branch SET ${fields.join(', ')} WHERE BranchID = ?`;
        values.push(branchId);

        const result = await conn.query(query, values);

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            throw new Error('Branch not found');
        }
        return { id: branchId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

// update status instead of delete
// async function remove(branchId) {
//     let conn;
//     try {
//         conn = await pool.getConnection();
//         const result = await conn.query('DELETE FROM branch WHERE BranchID = ?', [branchId]);
//         return result; // Ensure the result object is returned
//     } catch (error) {
//         throw error;
//     } finally {
//         if (conn) conn.release();
//     }
// }

module.exports = {
    // getAll,
    create,
    getByOwnerId,
    update,
    getByUsername,
    getOwnerByReferenceId,
    addOwner,
    getOwner
    // remove
};