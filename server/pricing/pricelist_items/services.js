const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query('SELECT * FROM pricelist_item');

        // Ensure queryResult is an array
        const resultRows = Array.isArray(rows) ? rows : [rows];

        resultRows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });

        return resultRows;
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

        // Perform the INSERT query
        const result = await conn.query(
            'INSERT INTO pricelist_item (PriceListID, ItemID, Price, CreatedAt) VALUES (?, ?, ?, ?)',
            [
                data.pricelistId,
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

// async function getById(pricelistItemId) {
//     let conn;
//     try {
//         conn = await pool.getConnection();

//         const rows = await conn.query(
//             'SELECT * FROM pricelist_item WHERE PriceListItemID = ?',
//             [pricelistItemId]
//         );
//         return rows[0]; // Return the first row if found
//     } catch (error) {
//         throw error;
//     } finally {
//         if (conn) conn.release();
//     }
// }

// async function update(pricelistItemId, data) {
//     let conn;
//     try {
//         conn = await pool.getConnection();

//         const fields = [];
//         const values = [];

//         if (data.pricelistId) {
//             fields.push('PriceListID = ?');
//             values.push(data.pricelistId);
//         }

//         if (data.itemId) {
//             fields.push('ItemID = ?');
//             values.push(data.itemId);
//         }

//         if (data.price) {
//             fields.push('Price = ?');
//             values.push(data.price);
//         }

//         if (fields.length === 0) {
//             throw new Error('No fields to update');
//         }

//         const query = `UPDATE pricelist_item SET ${fields.join(', ')} WHERE PriceListItemID = ?`;
//         values.push(pricelistItemId);

//         const result = await conn.query(query, values);

//         if (result.affectedRows === 0) {
//             throw new Error('Pricelist item not found');
//         }
//         return { id: pricelistItemId, ...data };
//     } catch (error) {
//         throw error;
//     } finally {
//         if (conn) conn.release();
//     }
// }

async function getItemsWithPricesForBranch(branchId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const query = `
            SELECT 
                i.ItemID,
                i.Name AS ItemName,
                i.Classification,
                i.UnitOfMeasurement,
                i.Description,
                COALESCE(pli.Price, 0) AS ItemPrice
            FROM 
                item i
            LEFT JOIN pricelist_item pli ON i.ItemID = pli.ItemID
            LEFT JOIN pricelist pl ON pli.PriceListID = pl.PriceListID
            WHERE 
                pl.BranchID = ? OR pl.BranchID IS NULL
        `;

        const rows = await conn.query(query, [branchId]);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function updateOrCreatePricelistItemForBranch(userId, branchId, itemId, price) {
    let conn;
    try {
        conn = await pool.getConnection();

        const manilaTimestamp = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        await conn.query('SET @current_user_id = ?', [userId]);

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Check if a pricelist exists for the branch
        const [pricelist] = await conn.query(
            'SELECT PriceListID FROM pricelist WHERE BranchID = ? ORDER BY DateEffective DESC LIMIT 1',
            [branchId]
        );
        console.log('Pricelist found:', pricelist);

        let priceListId;
        if (pricelist) {
            priceListId = pricelist.PriceListID;
        } else {
            // Create a new pricelist if it doesn't exist
            const result = await conn.query(
                'INSERT INTO pricelist (BranchID, DateEffective) VALUES (?, ?)',
                [branchId, createdAt]
            );
            priceListId = result.insertId;
        }

        // Check if a pricelist_item exists for the item
        const [pricelistItem] = await conn.query(
            'SELECT PriceListItemID FROM pricelist_item WHERE PriceListID = ? AND ItemID = ?',
            [priceListId, itemId]
        );

        if (pricelistItem) {
            // Update the existing pricelist_item
            await conn.query(
                'UPDATE pricelist_item SET Price = ?, UpdatedAt = ? WHERE PriceListID = ? AND ItemID = ?',
                [price, manilaTimestamp, priceListId, itemId]
            );
        } else {
            // Create a new pricelist_item
            await conn.query(
                'INSERT INTO pricelist_item (PriceListID, ItemID, Price, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?)',
                [priceListId, itemId, price, createdAt, manilaTimestamp]
            );
        }

        return { priceListId, itemId, price };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function updateOrCreatePricelistItemForBuyer(userId, buyerId, itemId, price) {
    let conn;
    try {
        conn = await pool.getConnection();

        const manilaTimestamp = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        await conn.query('SET @current_user_id = ?', [userId]);

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Check if a pricelist exists for the branch
        const [pricelist] = await conn.query(
            'SELECT PriceListID FROM pricelist WHERE BuyerID = ? ORDER BY DateEffective DESC LIMIT 1',
            [buyerId]
        );
        console.log('Pricelist found:', pricelist);

        let priceListId;
        if (pricelist) {
            priceListId = pricelist.PriceListID;
        } else {
            // Create a new pricelist if it doesn't exist
            const result = await conn.query(
                'INSERT INTO pricelist (BuyerID, DateEffective) VALUES (?, ?)',
                [buyerId, createdAt]
            );
            priceListId = result.insertId;
        }

        // Check if a pricelist_item exists for the item
        const [pricelistItem] = await conn.query(
            'SELECT PriceListItemID FROM pricelist_item WHERE PriceListID = ? AND ItemID = ?',
            [priceListId, itemId]
        );

        if (pricelistItem) {
            // Update the existing pricelist_item
            await conn.query(
                'UPDATE pricelist_item SET Price = ?, UpdatedAt = ? WHERE PriceListID = ? AND ItemID = ?',
                [price, manilaTimestamp, priceListId, itemId]
            );
        } else {
            // Create a new pricelist_item
            await conn.query(
                'INSERT INTO pricelist_item (PriceListID, ItemID, Price, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?)',
                [priceListId, itemId, price, createdAt, manilaTimestamp]
            );
        }

        return { priceListId, itemId, price };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function processHistoricalUpload(userId, entityId, entityType, dateEffective, prices) {
    let conn;
    try {
        conn = await pool.getConnection();

        console.log('Processing historical upload with data:', { userId, entityId, entityType, dateEffective });

        // Start Transaction
        await conn.query('START TRANSACTION');

        // Set UserID session variable (although trigger won't fire on INSERT, it's good practice)
        await conn.query('SET @current_user_id = ?', [userId]);

        // 1. Create the NEW Historical Pricelist Header
        let headerSql;
        let headerValues;

        if (entityType === 'branch') {
            headerSql = 'INSERT INTO pricelist (BranchID, DateEffective) VALUES (?, ?)';
            headerValues = [entityId, dateEffective];
        } else if (entityType === 'buyer') {
            headerSql = 'INSERT INTO pricelist (BuyerID, DateEffective) VALUES (?, ?)';
            headerValues = [entityId, dateEffective];
        } else {
            throw new Error('Invalid entity type.');
        }

        const headerResult = await conn.query(headerSql, headerValues);
        const priceListId = headerResult.insertId;

        // 2. Insert each pricelist item individually
        const manilaTimestamp = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        for (const price of prices) {
            await conn.query(
                'INSERT INTO pricelist_item (PriceListID, ItemID, Price, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?)',
                [priceListId, price.itemId, price.price, manilaTimestamp, manilaTimestamp]
            );
        }

        // 3. Commit the transaction
        await conn.query('COMMIT');

    } catch (error) {
        // Rollback on any failure (critical for data integrity)
        await conn.query('ROLLBACK');
        throw error;
    } finally {
        if (conn) conn.release();
    }
};

async function fetchHistoricalCost(itemId, branchId) {
    let conn;
    try {
        conn = await pool.getConnection();

        const sql = `
            SELECT
                ti.ItemID,
                SUM(ti.Quantity * ti.Price) AS TotalHistoricalCost,
                SUM(ti.Quantity) AS TotalPurchasedQuantity
            FROM
                transaction_item ti
            JOIN
                transaction t ON ti.TransactionID = t.TransactionID
            WHERE
                ti.ItemID = ?
                AND t.TransactionType = 'purchase'
                AND t.BranchID = ?  
            GROUP BY
                ti.ItemID;
        `;

        const rows = await conn.query(sql, [itemId, branchId]);

        if (rows && rows.length > 0) {
            const row = rows[0];
            const totalCost = parseFloat(row.TotalHistoricalCost) || 0;
            const totalQuantity = parseFloat(row.TotalPurchasedQuantity) || 0;

            // Calculate the weighted average cost per unit
            const WAC = totalQuantity > 0 ? (totalCost / totalQuantity) : 0;

            return {
                ItemID: itemId,
                BranchID: branchId,
                TotalCostPurchased: totalCost.toFixed(2),
                TotalQuantityPurchased: totalQuantity,
                WeightedAverageCost: WAC.toFixed(2) // Average cost paid per unit
            };
        } else {
            return null; // Item not found in any purchase transactions
        }

    } catch (error) {
        console.error("SQL Error fetching historical cost:", error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    getAll,
    create,
    // getById,
    // update,
    getItemsWithPricesForBranch,
    updateOrCreatePricelistItemForBranch,
    updateOrCreatePricelistItemForBuyer,
    processHistoricalUpload,
    fetchHistoricalCost
};
