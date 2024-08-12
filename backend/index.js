const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "meet_up",
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err.stack);
        return;
    }
    console.log("Connected to MySQL as id " + connection.threadId);
});

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Test something");
});

const eventsRouter = require("./routes/events");

app.use("/events", eventsRouter);

app.listen(port, () => console.log(`App open on http://localhost:${port}`));
