const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "meet_up",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool.promise();
