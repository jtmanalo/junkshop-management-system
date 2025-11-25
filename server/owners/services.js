const pool = require('../db');
const moment = require('moment-timezone');
const axios = require('axios');

async function createOwner(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const result = await conn.query(
            'INSERT INTO owner (OwnerType, ReferenceID) VALUES (?, ?)',
            [
                data.ownerType,
                data.referenceId
            ]
        );

        return { id: result.insertId.toString(), ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    createOwner
};