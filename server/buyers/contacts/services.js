const pool = require('../../db');
const moment = require('moment-timezone');

async function create(buyerId, contactData) {
    let conn;
    try {
        conn = await pool.getConnection();

        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Convert isPrimary to an integer (1 for true, 0 for false)
        const isPrimary = contactData.isPrimary === 'true' ? 1 : 0;

        const result = await conn.query(
            `INSERT INTO buyer_contact (BuyerID, ContactMethod, ContactDetail, IsPrimary, CreatedAt) VALUES (?, ?, ?, ?, ?)`,
            [
                buyerId,
                contactData.contactMethod,
                contactData.contactDetail,
                isPrimary,
                createdAt
            ]
        );

        return { id: result.insertId.toString(), buyerId, ...contactData, isPrimary, createdAt };
    } catch (error) {
        console.error('Error in create function:', error.message, error.stack);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const queryResult = await conn.query('SELECT * FROM buyer_contact');

        // Ensure queryResult is an array
        const rows = Array.isArray(queryResult) ? queryResult : [queryResult];

        rows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });

        return rows;
    } catch (error) {
        console.error('Error in getAll function:', error.message, error.stack);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(contactId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM buyer_contact WHERE ContactID = ?', [contactId]);

        rows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });

        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getByBuyerId(buyerId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const queryResult = await conn.query(`
                SELECT 
                    b.BuyerID,
                    b.CompanyName,
                    b.ContactPerson,
                    b.Notes,
                    b.Status,
                    b.CreatedAt,
                    MAX(CASE WHEN bc.IsPrimary = 1 THEN CONCAT(bc.ContactMethod, ': ', bc.ContactDetail, ' (Created At: ', DATE_FORMAT(bc.CreatedAt, '%Y-%m-%d %H:%i'), ')') END) AS PrimaryContact,
                    GROUP_CONCAT(CASE WHEN bc.IsPrimary = 0 THEN CONCAT(bc.ContactMethod, ': ', bc.ContactDetail, ' (Created At: ', DATE_FORMAT(bc.CreatedAt, '%Y-%m-%d %H:%i'), ')') END SEPARATOR '; ') AS OtherContacts
                FROM 
                    buyer b
                LEFT JOIN 
                    buyer_contact bc
                ON 
                    b.BuyerID = bc.BuyerID
                WHERE 
                    b.BuyerID = ?
                GROUP BY 
                    b.BuyerID, b.CompanyName, b.ContactPerson, b.Notes, b.Status, b.CreatedAt;`
            , [buyerId]);

        console.log('Query result for getByBuyerId:', queryResult);

        // Ensure queryResult is an array
        const rows = Array.isArray(queryResult) ? queryResult : [queryResult];

        rows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });

        return rows;
    } catch (error) {
        console.error('Error in getByBuyerId function:', error.message, error.stack);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(contactId, contactData) {
    let conn;
    try {
        conn = await pool.getConnection();

        const fields = [];
        const values = [];

        // Enforce that if either contactMethod or contactDetail is updated, both are required
        if (contactData.contactMethod || contactData.contactDetail) {
            if (!contactData.contactMethod || !contactData.contactDetail) {
                throw new Error('Both contactMethod and contactDetail are required when updating either');
            }
            fields.push('ContactMethod = ?');
            values.push(contactData.contactMethod);

            fields.push('ContactDetail = ?');
            values.push(contactData.contactDetail);
        }

        // Allow isPrimary to be updated independently
        if (contactData.hasOwnProperty('isPrimary')) {
            const isPrimary = contactData.isPrimary === 'true' ? 1 : contactData.isPrimary === 'false' ? 0 : contactData.isPrimary;
            fields.push('IsPrimary = ?');
            values.push(isPrimary);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE buyer_contact SET ${fields.join(', ')} WHERE ContactID = ?`;
        values.push(contactId);

        console.log('Update query:', query);
        console.log('Update values:', values);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Contact not found');
        }
        return { id: contactId, ...contactData };
    } catch (error) {
        console.error('Error in update function:', error.message, error.stack);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    create,
    getAll,
    getByBuyerId,
    getById,
    update,
    // remove
}