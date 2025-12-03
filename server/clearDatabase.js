const pool = require('./db'); // Adjust path to your DB connection

async function clearDatabase() {
    const conn = await pool.getConnection();
    try {
        console.log('Clearing database...');
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        const tables = await conn.query('SHOW TABLES');
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            console.log(`Truncating table: ${tableName}`);
            await conn.query(`TRUNCATE TABLE ${tableName}`);
        }
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Database cleared successfully.');
    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        conn.release();
    }
}

clearDatabase();