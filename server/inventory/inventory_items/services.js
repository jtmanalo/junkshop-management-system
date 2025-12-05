const pool = require('../../db');
const moment = require('moment-timezone');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        const queryResult = await conn.query('SELECT * FROM inventory_item');

        // Ensure queryResult is an array
        const rows = Array.isArray(queryResult) ? queryResult : [queryResult];

        rows.forEach(row => {
            if (row.CreatedAt) {
                row.CreatedAt = moment(row.CreatedAt).tz('Asia/Manila').format();
            }
        });

        return rows;
    }
    catch (error) {
        throw error;
    }
    finally {
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
            'INSERT INTO inventory_item (InventoryID, ItemID, TotalQuantity, CreatedAt) VALUES (?, ?, ?, ?)',
            [
                data.inventoryId,
                data.itemId,
                data.totalQuantity || 0,
                createdAt
            ]
        );

        // Return the inserted inventory item data
        return { id: result.insertId.toString(), ...data, createdAt };
    }
    catch (error) {
        throw error;
    }
    finally {
        if (conn) conn.release();
    }
}

// async function getById(inventoryitemId) {
//     let conn;
//     try {
//         conn = await pool.getConnection();
//         const rows = await conn.query('SELECT * FROM inventory_item WHERE InventoryItemID = ?', [inventoryitemId]);

//         return rows[0]; // Return the first row if found
//     }
//     catch (error) {
//         throw error;
//     }
//     finally {
//         if (conn) conn.release();
//     }
// }

async function recordPrevious(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        const branchId = parseInt(data.branchId, 10);
        const itemId = parseInt(data.itemId, 10);

        const timezone = moment.tz('Asia/Manila');
        const previousDate = moment(timezone).subtract(1, 'months');
        // Use a valid DATE value (first day of previous month)
        const date = previousDate.startOf('month').format('YYYY-MM-01');

        // console.log('date:', date);

        const existingInventory = await conn.query('SELECT * FROM inventory WHERE BranchID = ? AND Date = ?',
            [branchId, date]);

        let inventoryId;
        if (existingInventory.length > 0) {
            // Ensure BigInt or string is converted to a serializable number
            const inv = existingInventory[0].InventoryID;
            inventoryId = typeof inv === 'bigint' ? Number(inv) : Number(inv);
        } else {
            const newInventory = await conn.query(
                'INSERT INTO inventory (BranchID, Date, CreatedAt) VALUES (?, ?, ?)',
                [branchId, date, moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss')]
            );
            inventoryId = typeof newInventory.insertId === 'bigint' ? Number(newInventory.insertId) : Number(newInventory.insertId);
        }

        // Check if inventory item already exists for this inventory and item
        const existingItem = await conn.query(
            'SELECT * FROM inventory_item WHERE InventoryID = ? AND ItemID = ?',
            [inventoryId, itemId]
        );

        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        let insertedId;

        if (existingItem.length > 0) {
            // Update existing record instead of inserting
            await conn.query(
                'UPDATE inventory_item SET TotalQuantity = ? WHERE InventoryID = ? AND ItemID = ?',
                [data.totalQuantity || 0, inventoryId, itemId]
            );
            insertedId = existingItem[0].InventoryItemID;
        } else {
            // Insert new record
            const result = await conn.query(
                'INSERT INTO inventory_item (TotalQuantity, InventoryID, ItemID, CreatedAt) VALUES (?, ?, ?, ?)',
                [data.totalQuantity || 0, inventoryId, itemId, createdAt]
            );

            if (result.affectedRows === 0) {
                throw new Error('Inventory Item not found');
            }
            insertedId = result.insertId;
        }

        return {
            id: typeof insertedId === 'bigint' ? Number(insertedId) : insertedId,
            inventoryId: Number(inventoryId),
            itemId: Number(itemId),
            totalQuantity: Number(data.totalQuantity || 0),
            createdAt
        };
    }
    catch (error) {
        throw error;
    }
    finally {
        if (conn) conn.release();
    }
}

async function getPreviousRecords(branchId, month, year) {
    let conn;
    try {
        conn = await pool.getConnection();

        let targetMonth = month;
        let targetYear = year;

        if (!month || !year) {
            const timezone = moment.tz('Asia/Manila');
            const previousDate = moment(timezone).subtract(1, 'months');
            targetMonth = previousDate.month() + 1; // moment returns 0-11
            targetYear = previousDate.year();
        }

        const date = moment.tz(`${targetYear}-${targetMonth}`, 'YYYY-M', 'Asia/Manila').startOf('month').format('YYYY-MM-01');
        // console.log('Fetching inventory for date:', date);

        const inventory = await conn.query(
            'SELECT * FROM inventory WHERE BranchID = ? AND Date = ?',
            [branchId, date]
        );

        if (inventory.length === 0) {
            // console.log('No inventory found for branchId:', branchId, 'date:', date);
            return [];
        }

        const inventoryId = inventory[0]?.InventoryID;
        // console.log('Found inventoryId:', inventoryId);

        const inventoryItems = await conn.query(
            'SELECT * FROM inventory_item WHERE InventoryID = ?',
            [inventoryId]
        );

        return inventoryItems;
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    getAll,
    create,
    // getById,
    recordPrevious,
    getPreviousRecords
};