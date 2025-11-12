
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

// Import user routes
const userRoutes = require('./users/routes');
const employeeRoutes = require('./employees/routes');

app.use('/api', userRoutes); // Prefix routes with /api
app.use('/api', employeeRoutes); // Prefix routes with /api