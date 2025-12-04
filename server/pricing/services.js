const pool = require('../db');
const moment = require('moment-timezone');
const { get } = require('./routes');

async function getAll() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM pricelist');

        // Ensures timestamps are in UTC+8
        rows.forEach(row => {
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

async function create(data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Convert timestamps to MariaDB-compatible format
        const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
        const dateEffective = moment(data.dateEffective).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

        // Perform the INSERT query
        const result = await conn.query(
            'INSERT INTO pricelist (BuyerID, BranchID, DateEffective, CreatedAt) VALUES (?, ?, ?, ?)',
            [
                data.buyerId,
                data.branchId,
                dateEffective,
                createdAt
            ]
        );

        // Return the inserted pricelist data
        return { id: result.insertId.toString(), ...data, createdAt };
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function getById(pricelistId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Perform the SELECT query
        const rows = await conn.query('SELECT * FROM pricelist WHERE PriceListID = ?', [pricelistId]);

        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function update(pricelistId, data) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Build the SET clause dynamically based on provided data
        const fields = [];
        const values = [];

        if (data.buyerId) {
            fields.push('BuyerID = ?');
            values.push(data.buyerId);
        }
        if (data.branchId) {
            fields.push('BranchID = ?');
            values.push(data.branchId);
        }
        if (data.effectiveDate) {
            fields.push('EffectiveDate = ?');
            values.push(data.effectiveDate);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE pricelist SET ${fields.join(', ')} WHERE PriceListID = ?`;
        values.push(pricelistId);

        const result = await conn.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error('Pricelist not found');
        }
        return { id: pricelistId, ...data };
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

async function getPriceTrend(itemId, entityId, entityType) {
    let conn;
    try {
        conn = await pool.getConnection();

        // Ensure entityType is lowercase for consistent comparison
        const typeLower = entityType.toLowerCase();

        // Base query joins the activity log to the header tables
        const baseQuery = `
            SELECT
                pa.NewPrice,
                pa.UpdatedAt
            FROM
                pricelist_activity pa
            JOIN
                pricelist_item pi ON pa.PriceListItemID = pi.PriceListItemID
            JOIN
                pricelist p ON pi.PriceListID = p.PriceListID
            WHERE
                pi.ItemID = ?
                AND (
                    (LOWER(?) = 'buyer' AND p.BuyerID = ?) OR
                    (LOWER(?) = 'branch' AND p.BranchID = ?)
                )
            ORDER BY
                pa.UpdatedAt ASC
        `;

        // Parameters: [ItemID, EntityType, EntityID, EntityType, EntityID]
        const params = [
            itemId,
            typeLower, entityId,
            typeLower, entityId
        ];

        const rows = await conn.query(baseQuery, params);

        // Format timestamps to UTC+8 (Asia/Manila)
        rows.forEach(row => {
            if (row.UpdatedAt) {
                // Ensure the output is formatted as a standardized string for the frontend
                row.UpdatedAt = moment(row.UpdatedAt).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
            }
        });

        return rows;
    } catch (error) {
        // Log the actual SQL error for debugging
        console.error("SQL Error in getPriceTrend service:", error);
        throw new Error("Failed to retrieve price trend data.");
    } finally {
        if (conn) conn.release();
    }
}

async function fetchNetIncomeTrend(year, branchId) {
    let conn;
    try {
        if (!branchId) {
            throw new Error("Branch ID is required.");
        }

        conn = await pool.getConnection();

        // Use the SQL query defined above
        const sql = `
                SELECT
                    YEAR(t.TransactionDate) AS report_year,
                    MONTH(t.TransactionDate) AS report_month_num,
                    DATE_FORMAT(t.TransactionDate, '%Y-%m') AS report_period,
                    
                    SUM(CASE 
                        WHEN t.TransactionType = 'sale' THEN t.TotalAmount
                        ELSE 0
                    END) AS total_revenue,
                    
                    SUM(CASE 
                        WHEN t.TransactionType IN ('purchase', 'expense') THEN t.TotalAmount
                        ELSE 0
                    END) AS total_expenses_and_costs,
                    
                    SUM(CASE 
                        WHEN t.TransactionType = 'sale' THEN t.TotalAmount
                        WHEN t.TransactionType IN ('purchase', 'expense') THEN -t.TotalAmount
                        -- Loan/Repayment principal is correctly ignored (0 effect on Net Income)
                        WHEN t.TransactionType IN ('loan', 'repayment') THEN 0 
                        ELSE 0 
                    END) AS net_income_value
                    
                FROM
                    transaction t
                WHERE
                    t.Status = 'completed'
                    AND YEAR(t.TransactionDate) = ?
                    AND t.BranchID = ?
                GROUP BY
                    report_period
                ORDER BY
                    report_period ASC;
    `;

        // Ensure the year parameter is a number for the SQL filter
        const rows = await conn.query(sql, [year, branchId]);

        return rows;
    } catch (error) {
        console.error("SQL Error fetching net income trend:", error);
        throw new Error("Failed to retrieve net income data.");
    } finally {
        if (conn) conn.release();
    }
}

// Example: services/analytics.service.js

async function fetchDailyMetrics() {
    let conn;
    try {
        conn = await pool.getConnection();

        // 1. Define Dates (Manila Time is CRITICAL here)
        const manilaNow = moment().tz('Asia/Manila');

        const today = manilaNow.format('YYYY-MM-DD');
        const yesterday = manilaNow.subtract(1, 'day').format('YYYY-MM-DD');
        const lastWeek = manilaNow.subtract(7, 'days').format('YYYY-MM-DD'); // Example for Total Purchase trend

        // 2. Query: Fetch consolidated amounts for TODAY and YESTERDAY (simplified)
        const sql = `
            SELECT
                t.TransactionType,
                SUM(CASE WHEN DATE(t.TransactionDate) = ? THEN t.TotalAmount ELSE 0 END) AS today_amount,
                SUM(CASE WHEN DATE(t.TransactionDate) = ? THEN t.TotalAmount ELSE 0 END) AS prev_amount
            FROM
                transaction t
            WHERE
                t.Status = 'completed'
                AND t.TransactionType IN ('sale', 'purchase', 'expense')
            GROUP BY
                t.TransactionType;
        `;

        // Use yesterday's date as the "previous period" comparison
        const rows = await conn.query(sql, [today, yesterday]);

        // 3. Process Data into a Clean Object (Node.js)
        const dataMap = rows.reduce((acc, row) => {
            acc[row.TransactionType] = { today: row.today_amount, prev: row.prev_amount };
            return acc;
        }, {});

        // 4. Calculate Gross Profit and Net Income in Node.js
        const revenue = dataMap.sale?.today || 0;
        const purchase = dataMap.purchase?.today || 0;
        const expenses = dataMap.expense?.today || 0;

        return {
            revenue: { today: revenue, prev: dataMap.sale?.prev || 0 },
            totalPurchase: { today: purchase, prev: dataMap.purchase?.prev || 0 },
            expenses: { today: expenses, prev: dataMap.expense?.prev || 0 },

            // Calculated Metrics (Gross Profit = Revenue - Cost of Goods Sold/Purchases)
            grossProfit: {
                today: revenue - purchase,
                prev: (dataMap.sale?.prev || 0) - (dataMap.purchase?.prev || 0),
            },

            // Calculated Metrics (Net Income = Revenue - Expenses - Purchases)
            netIncome: {
                today: revenue - expenses - purchase,
                prev: (dataMap.sale?.prev || 0) - (dataMap.expense?.prev || 0) - (dataMap.purchase?.prev || 0),
            }
        };

    } catch (error) {
        console.error("Error fetching daily metrics:", error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

async function fetchBestSellPrice(itemId) {
    let conn;
    try {
        conn = await pool.getConnection();

        // 1. Find the MAX DateEffective for each Buyer
        // 2. Filter the pricelist_item based on that most recent, active pricelist
        // 3. Select the TOP price.
        const sql = `
            SELECT 
                pli.ItemID,
                b.CompanyName AS BestBuyerName,
                pli.Price AS BestBuyerPrice
            FROM 
                pricelist_item pli
            JOIN 
                item i ON pli.ItemID = i.ItemID
            JOIN 
                pricelist pl ON pli.PriceListID = pl.PriceListID
            JOIN 
                buyer b ON pl.BuyerID = b.BuyerID
            WHERE 
                -- 1. Filter by the specific Item
                pli.ItemID = ?
                -- 2. Filter by Active Buyers
                AND b.Status = 'active'
                -- 3. Ensure we only use the most recent PriceList for each Buyer
                AND pl.PriceListID = (
                    SELECT 
                        pl_sub.PriceListID 
                    FROM 
                        pricelist pl_sub
                    WHERE 
                        pl_sub.BuyerID = pl.BuyerID
                        AND pl_sub.BranchID IS NULL -- Only consider Buyer PriceLists (where BranchID is NULL)
                    ORDER BY 
                        pl_sub.DateEffective DESC, 
                        pl_sub.CreatedAt DESC
                    LIMIT 1
                )
            ORDER BY 
                pli.Price DESC  -- Order by price descending
            LIMIT 1;            -- Get the single highest price
        `;

        const rows = await conn.query(sql, [itemId]);

        if (rows && rows.length > 0) {
            return {
                ItemID: rows[0].ItemID,
                BestBuyerName: rows[0].BestBuyerName,
                // Ensure the price is returned as a float
                BestBuyerPrice: parseFloat(rows[0].BestBuyerPrice)
            };
        } else {
            // No valid price found (item not in any active price list)
            return null;
        }

    } catch (error) {
        console.error("SQL Error fetching best sell price:", error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update,
    createActivityLog,
    getPriceTrend,
    fetchNetIncomeTrend,
    fetchDailyMetrics,
    fetchBestSellPrice
};