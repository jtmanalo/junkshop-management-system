const pool = require('../db');
const moment = require('moment-timezone');

async function createBranch(data) {
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

async function getBranchesofOwner() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            `SELECT b.*
             FROM branch b
             JOIN owner o ON b.OwnerID = o.OwnerID
             WHERE o.OwnerType = 'User'`
        );
        console.log('Branches fetched for usertype owner:', rows);
        return rows; // Return all branches for the given username
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

async function createPricelist(branchId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        dateEffective = createdAt;

        const result = await conn.query(
            'INSERT INTO pricelist (BranchID, DateEffective, CreatedAt) VALUES (?, ?, ?)',
            [
                branchId,
                dateEffective,
                createdAt
            ]
        );

        return { id: result.insertId.toString(), branchId, dateEffective, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getBrancheswithUserTypeOwner() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT b.BranchID, b.Name, b.Location
             FROM branch b
             JOIN owner o ON b.OwnerID = o.OwnerID
             JOIN user u ON o.ReferenceID = u.UserID
             WHERE o.OwnerType = 'user' AND u.UserType = 'owner' AND b.Status = 'active'`
        );
        return rows; // Return all branches with owner user type
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    createBranch,
    update,
    getBranchesofOwner,
    addOwner,
    getOwner,
    createPricelist,
    getBrancheswithUserTypeOwner
};