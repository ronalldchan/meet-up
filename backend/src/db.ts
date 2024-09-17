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

export default pool;
