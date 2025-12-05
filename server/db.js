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
    timezone: '+08:00',
    connectTimeout: 10000,
});

pool.getConnection()
    .then(conn => {
        conn.query('USE ' + process.env.DB_NAME);
        console.log('Connected to MariaDB and database selected!');
        conn.release();
    })
    .catch(err => {
        console.error('Error connecting to MariaDB:', err);
    });

const closePool = async () => {
    try {
        console.log('Closing database connection pool...');
        await pool.end();
        console.log('Database connection pool closed.');
    } catch (err) {
        console.error('Error closing database connection pool:', err);
    }
};

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await closePool();
    process.exit(0);
});

module.exports = pool;