const pool = require('../../db');
const moment = require('moment-timezone');

// Items Page get all items of a branch with pricing
async function getAllItemsWithPricing() {
    let conn;
    try {
        conn = await pool.getConnection();

        const query = `
            SELECT 
                b.BranchID,
                b.Name AS BranchName,
                b.Location AS BranchLocation,
                i.ItemID,
                i.Name,  
                i.Classification,
                i.UnitOfMeasurement,
                i.Description,
                pli.Price AS ItemPrice
            FROM 
                branch b
            JOIN 
                pricelist pl ON b.BranchID = pl.BranchID
            JOIN 
                pricelist_item pli ON pl.PriceListID = pli.PriceListID
            JOIN 
                item i ON pli.ItemID = i.ItemID
            WHERE 
                b.Status = 'active'
                AND pl.BuyerID IS NULL
            ORDER BY 
                i.ItemID;
        `;

        const rows = await conn.query(query);

        // Ensures timestamps are in UTC+8 if applicable
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

async function getItemsWithPrice(branchId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const query = `
            SELECT 
                b.BranchID,
                b.Name AS BranchName,
                b.Location AS BranchLocation,
                i.ItemID,
                i.Name,  
                i.Classification,
                i.UnitOfMeasurement,
                i.Description,
                pli.Price AS ItemPrice
            FROM 
                branch b
            JOIN 
                pricelist pl ON b.BranchID = pl.BranchID
            JOIN 
                pricelist_item pli ON pl.PriceListID = pli.PriceListID
            JOIN 
                item i ON pli.ItemID = i.ItemID
            WHERE 
                b.Status = 'active'
                AND pl.BuyerID IS NULL
                AND b.BranchID = ?
            ORDER BY 
                i.ItemID;
        `;

        const rows = await conn.query(query, [branchId]);

        // Ensures timestamps are in UTC+8 if applicable
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

async function getItemsOfBuyerWithPrice(buyerId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const query = `
            SELECT
                b.BuyerID,
                b.CompanyName,
                b.ContactPerson,
                i.ItemID,
                i.Name,
                i.Classification,
                i.UnitOfMeasurement,
                i.Description,
                pli.Price AS ItemPrice
            FROM
                buyer b
            JOIN
                pricelist pl ON b.BuyerID = pl.BuyerID
            JOIN
                pricelist_item pli ON pl.PriceListID = pli.PriceListID
            JOIN
                item i ON pli.ItemID = i.ItemID
            WHERE
                b.Status = 'active'
                AND b.BuyerID = ?
                AND pl.BranchID IS NULL
            ORDER BY
                i.ItemID;
        `;

        const rows = await conn.query(query, [buyerId]);

        // Ensures timestamps are in UTC+8 if applicable
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

async function getAllItems() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT ItemID, Name, Classification, UnitOfMeasurement, Description FROM item');

        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getItemsWithPricesForBranch(branchId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const query = `
            SELECT 
                i.ItemID,
                i.Name,
                i.Classification,
                pi.Price AS ItemPrice
            FROM 
                item i
            LEFT JOIN 
                pricelist_item pi 
            ON 
                i.ItemID = pi.ItemID
            LEFT JOIN 
                pricelist p 
            ON 
                pi.PriceListID = p.PriceListID
            WHERE 
                p.BranchID = ? 
    `;
        return await conn.query(query, [branchId]);
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getItemsWithPricesForBuyer(buyerId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const query = `
            SELECT 
                i.ItemID,
                i.Name,
                i.Classification,
                pi.Price AS ItemPrice
            FROM 
                item i
            LEFT JOIN 
                pricelist_item pi 
            ON 
                i.ItemID = pi.ItemID
            LEFT JOIN 
                pricelist p 
            ON 
                pi.PriceListID = p.PriceListID
            WHERE 
                p.BuyerID = ? 
    `;
        return await conn.query(query, [buyerId]);
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

        // Validate required fields
        if (!data.name || !data.unitOfMeasurement) {
            throw new Error("Missing required fields: 'Name' and 'UnitOfMeasurement' are mandatory.");
        }

        // Debugging: Log the data object
        console.log("Creating item with data:", data);

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Perform the INSERT query 
        const result = await conn.query(
            'INSERT INTO item (Name, UnitOfMeasurement, Classification, Description, CreatedAt) VALUES (?, ?, ?, ?, ?)',
            [
                data.name,
                data.unitOfMeasurement,
                data.classification || null, // Default to null if not provided
                data.description || null,    // Default to null if not provided
                createdAt
            ]
        );

        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        console.error("Error in createItem:", error.message);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function createPricelistItem(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Perform the INSERT query
        const result = await conn.query(
            'INSERT INTO pricelist_item (PriceListID, ItemID, Price, CreatedAt) VALUES (?, ?, ?, ?)',
            [
                data.priceListId,
                data.itemId,
                data.price,
                createdAt
            ]
        );

        // Return the inserted pricelist item data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(itemId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM item WHERE ItemID = ?', [itemId]);
        return rows[0]; // Return the first row if found
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(itemId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const fields = [];
        const values = [];

        if (data.name) {
            fields.push('Name = ?');
            values.push(data.name);
        }

        if (data.unitOfMeasurement) {
            fields.push('UnitOfMeasurement = ?');
            values.push(data.unitOfMeasurement);
        }

        if (data.classification) {
            fields.push('Classification = ?');
            values.push(data.classification);
        }

        if (data.description) {
            fields.push('Description = ?');
            values.push(data.description);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE item SET ${fields.join(', ')} WHERE ItemID = ?`;
        values.push(itemId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Item not found');
        }
        return { id: itemId, ...data };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getAllBranches() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT BranchID, Name, Location FROM branch WHERE Status = ?', ['active']);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function updateItemPriceForBranch(branchId, itemId, itemPrice, userId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const manilaTimestamp = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        await conn.query('SET @current_user_id = ?', [userId]);

        // First, get the PriceListID for the branch where BuyerID is NULL
        const pricelistRows = await conn.query(
            'SELECT PriceListID FROM pricelist WHERE BranchID = ? AND BuyerID IS NULL',
            [branchId]
        );

        if (pricelistRows.length === 0) {
            throw new Error('Pricelist not found for the specified branch');
        }

        const priceListId = pricelistRows[0].PriceListID;

        // Next, check if a pricelist_item already exists for the given ItemID and PriceListID
        const pricelistItemRows = await conn.query(
            'SELECT PriceListItemID, Price FROM pricelist_item WHERE PriceListID = ? AND ItemID = ?',
            [priceListId, itemId]
        );

        if (pricelistItemRows.length > 0) {
            // If it exists, update the price
            const oldPrice = pricelistItemRows[0].Price;
            const priceListItemId = pricelistItemRows[0].PriceListItemID;

            await conn.query(
                'UPDATE pricelist_item SET Price = ?, UpdatedAt = ? WHERE PriceListItemID = ?',
                [itemPrice, manilaTimestamp, priceListItemId]
            );

            // Insert a new record into pricelist_activity
            // const updatedAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
            // await conn.query(
            //     'INSERT INTO pricelist_activity (PriceListItemID, OldPrice, NewPrice, UpdatedAt, UserID) VALUES (?, ?, ?, ?, ?)',
            //     [priceListItemId, oldPrice, itemPrice, updatedAt, userId]
            // );
        } else {
            // If it doesn't exist, insert a new record
            const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
            await conn.query(
                'INSERT INTO pricelist_item (PriceListID, ItemID, Price, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?)',
                [priceListId, itemId, itemPrice, createdAt, manilaTimestamp]
            );
        }

        return { branchId, itemId, itemPrice };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function updateItemPriceForBuyer(buyerId, itemId, itemPrice, userId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // First, get the PriceListID for the branch where BuyerID is NULL
        const pricelistRows = await conn.query(
            'SELECT PriceListID FROM pricelist WHERE BuyerID = ? AND BranchID IS NULL',
            [buyerId]
        );

        if (pricelistRows.length === 0) {
            throw new Error('Pricelist not found for the specified buyer');
        }

        const priceListId = pricelistRows[0].PriceListID;

        // Next, check if a pricelist_item already exists for the given ItemID and PriceListID
        const pricelistItemRows = await conn.query(
            'SELECT PriceListItemID, Price FROM pricelist_item WHERE PriceListID = ? AND ItemID = ?',
            [priceListId, itemId]
        );

        if (pricelistItemRows.length > 0) {
            // If it exists, update the price
            const oldPrice = pricelistItemRows[0].Price;
            const priceListItemId = pricelistItemRows[0].PriceListItemID;

            await conn.query(
                'UPDATE pricelist_item SET Price = ? WHERE PriceListItemID = ?',
                [itemPrice, priceListItemId]
            );

            // Insert a new record into pricelist_activity
            const updatedAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
            await conn.query(
                'INSERT INTO pricelist_activity (PriceListItemID, OldPrice, NewPrice, UpdatedAt, UserID) VALUES (?, ?, ?, ?, ?)',
                [priceListItemId, oldPrice, itemPrice, updatedAt, userId]
            );
        } else {
            // If it doesn't exist, insert a new record
            const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
            await conn.query(
                'INSERT INTO pricelist_item (PriceListID, ItemID, Price, CreatedAt) VALUES (?, ?, ?, ?)',
                [priceListId, itemId, itemPrice, createdAt]
            );
        }

        return { buyerId, itemId, itemPrice };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

// New: Get daily accumulation per item for a branch/month/year
async function getDailyAccumulation({ branchId, year, month }) {
    let conn;
    try {
        conn = await pool.getConnection();
        const m = String(month).padStart(2, '0');
        const startDate = `${year}-${m}-01`;
        const endDate = moment(startDate).tz('Asia/Manila').endOf('month').format('YYYY-MM-DD');

        const rows = await conn.query(
            `SELECT ti.ItemID, DATE(t.TransactionDate) as DateOnly, DAY(t.TransactionDate) as DayNum,
                    SUM(ti.Quantity) as TotalQty
             FROM transaction_item ti
             JOIN transaction t ON t.TransactionID = ti.TransactionID
             WHERE t.BranchID = ?
               AND t.TransactionDate BETWEEN ? AND ?
             GROUP BY ti.ItemID, DateOnly, DayNum
             ORDER BY ti.ItemID, DayNum`,
            [branchId, startDate, endDate]
        );

        const byItem = {};
        for (const r of rows) {
            const itemIdNum = typeof r.ItemID === 'bigint' ? Number(r.ItemID) : r.ItemID;
            const day = r.DayNum;
            const qty = r.TotalQty;
            if (!byItem[itemIdNum]) byItem[itemIdNum] = {};
            byItem[itemIdNum][day] = qty;
        }

        return byItem;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function createActivityLog(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert LoggedAt to UTC+8 before inserting
        const loggedAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        const result = await conn.query(
            'INSERT INTO activity_log (UserID,' + (data.branchId ? ' BranchID,' : '') + ' ActivityType, Description, LoggedAt) VALUES (?,' + (data.branchId ? '?, ' : '') + '?, ?, ?)',
            data.branchId ?
                [
                    data.userId,
                    data.branchId,
                    data.activityType,
                    data.description,
                    loggedAt,
                ] : [
                    data.userId,
                    data.activityType,
                    data.description,
                    loggedAt,
                ]
        );
        return { id: result.insertId, ...data, loggedAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getUsernameById(userId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT Username FROM user WHERE UserID = ?', [userId]);
        return rows[0]?.Username || 'Unknown User';
    } catch (error) {
        console.error('Error fetching username:', error);
        return 'Unknown User';
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    getAllItemsWithPricing,
    getAllItems,
    getItemsWithPricesForBranch,
    create,
    getById,
    update,
    createPricelistItem,
    getAllBranches,
    updateItemPriceForBranch,
    getItemsWithPricesForBuyer,
    updateItemPriceForBuyer,
    getItemsWithPrice,
    getItemsOfBuyerWithPrice,
    getDailyAccumulation,
    createActivityLog,
    getUsernameById
};
