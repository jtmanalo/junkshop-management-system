const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const inventorySvc = require('./inventory/services');
const pool = require('./db');
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Server is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.on('error', (err) => {
    console.error('Server encountered an error:', err);
});

pool.getConnection()
    .then(conn => {
        console.log('Database connection verified in index.js');
        conn.release();
    })
    .catch(err => {
        console.error('Database connection failed in index.js:', err);
        process.exit(1);
    });

const userRoutes = require('./users/routes');
const employeeRoutes = require('./employees/routes');
const sellerRoutes = require('./sellers/routes');
const branchRoutes = require('./branches/routes');
const buyerRoutes = require('./buyers/routes');
const contactRoutes = require('./buyers/contacts/routes');
const itemRoutes = require('./inventory/items/routes');
const transactionRoutes = require('./transactions/routes');
const pricelistRoutes = require('./pricing/routes');
const pricelistitemRoutes = require('./pricing/pricelist_items/routes');

// Cron job: ensure monthly inventory for all branches at midnight on 1st day
cron.schedule('0 0 1 * *', async () => {
    try {
        await inventorySvc.ensureMonthlyInventoryForAllBranches();
        console.log('[cron] Ensured monthly inventory for all branches');
    } catch (err) {
        console.error('[cron] Failed to ensure monthly inventory:', err);
    }
}, {
    timezone: 'Asia/Manila'
});
const inventoryRoutes = require('./inventory/routes');
const inventoryitemRoutes = require('./inventory/inventory_items/routes');
const shiftRoutes = require('./employees/shifts/routes');
const shiftemployeeRoutes = require('./employees/shift_employees/routes');
const pricelistactivityRoutes = require('./pricing/pricelist_activity/routes');

app.use('/api', userRoutes);
app.use('/api', employeeRoutes);
app.use('/api', sellerRoutes);
app.use('/api', branchRoutes);
app.use('/api', buyerRoutes);
app.use('/api', contactRoutes);
app.use('/api', itemRoutes);
app.use('/api', transactionRoutes);
app.use('/api', pricelistRoutes);
app.use('/api', pricelistitemRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', inventoryitemRoutes);
app.use('/api', shiftRoutes);
app.use('/api', shiftemployeeRoutes);
app.use('/api', pricelistactivityRoutes);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is connected to the frontend!' });
});