require('dotenv').config();
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 5
});
// Test the database connection
pool.getConnection()
    .then(conn => {
        console.log('Connected to MariaDB!');
        conn.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.error('Error connecting to MariaDB:', err);
    });

module.exports = pool;