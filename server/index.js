
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize the Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Define a basic route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle server errors
app.on('error', (err) => {
    console.error('Server encountered an error:', err);
});

// Import the database connection
const pool = require('./db');

pool.getConnection()
    .then(conn => {
        console.log('Database connection verified in index.js');
        conn.release();
    })
    .catch(err => {
        console.error('Database connection failed in index.js:', err);
        process.exit(1); // Exit if the database connection fails
    });

// Import routes
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
const transactionitemRoutes = require('./transactions/transaction_items/routes');
const weighinglogRoutes = require('./inventory/weighing_logs/routes');
const countinglogRoutes = require('./inventory/counting_logs/routes');
const inventoryRoutes = require('./inventory/routes');
const inventoryitemRoutes = require('./inventory/inventory_items/routes');
const shiftRoutes = require('./employees/shifts/routes');
const shiftemployeeRoutes = require('./employees/shift_employees/routes');
const pricelistactivityRoutes = require('./pricing/pricelist_activity/routes');
const activitylogRoutes = require('./activity_logs/routes');

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
app.use('/api', transactionitemRoutes);
app.use('/api', weighinglogRoutes);
app.use('/api', countinglogRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', inventoryitemRoutes);
app.use('/api', shiftRoutes);
app.use('/api', shiftemployeeRoutes);
app.use('/api', pricelistactivityRoutes);
app.use('/api', activitylogRoutes); 