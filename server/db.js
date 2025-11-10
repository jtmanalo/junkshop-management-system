const mariadb = require('mariadb');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('Database Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectTimeout: 10000,
});

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 10,
    connectTimeout: 10000, // Increase timeout to 10 seconds
});
// Test the database connection
pool.getConnection()
    .then(conn => {
        conn.query('USE ' + process.env.DB_NAME); // Explicitly select the database
        console.log('Connected to MariaDB and database selected!');
        conn.release();
    })
    .catch(err => {
        console.error('Error connecting to MariaDB:', err);
    });

module.exports = pool;