import mysql, { Pool } from "mysql2/promise";

const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // dateStrings: true,
    timezone: "Z",
});

const checkDbConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to MySQL pool.");
        connection.release();
    } catch (err) {
        console.error("Database connection failed:", err);
        throw new Error("Failed to connect to the database.");
    }
};
checkDbConnection();

export default pool;
