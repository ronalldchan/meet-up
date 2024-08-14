const express = require("express");
const router = express.Router();
const pool = require("../db");
const moment = require("moment");

const datetimeFormat = "YYYY-MM-DD HH:mm:ss";

function generateRandomId() {
    return Math.floor(Math.random() * 90000000) + 10000000;
}

function isValidSqlDatetime(datetime) {
    console.log(datetime);
    return moment(datetime, datetimeFormat, true).isValid();
}

class Event {
    id;
    name;
    startDate;
    endDate;
    users;

    constructor(id, name, startDate, endDate) {
        this.id = id;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.users = new Map();
    }
}

function isValidInput(input) {
    return !input || input.length < 3;
}

router
    .route("/")
    .get(async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT * FROM events");
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
    .post(async (req, res) => {
        try {
            const name = req.body.name;
            const start = req.body.startDate;
            const end = req.body.endDate;
            const timezone = req.body.timezone;
            if (isValidInput(name)) {
                res.status(400).send("Name is required and should be minimum of 3 characters");
                return;
            }
            if (!isValidSqlDatetime(start) || !isValidSqlDatetime(end)) {
                res.status(400).send(`Invalid datetime, should be in the following format "${datetimeFormat}"`);
                return;
            }
            let event_id = generateRandomId();
            const [results] = await pool.query(`insert into events values (?, ?, ?, ?, ?)`, [
                event_id,
                name,
                start,
                end,
                "PST",
            ]);
            console.log(results);
            res.status(201).json({ message: "Event created successfully", event_id: event_id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

router.route("/:id").get((req, res) => {
    res.send(`Get event with ID ${req.params.id}`);
});

router.route("/:id/users").post((req, res) => {
    let event = events.find((event) => event.id == req.params.id);
    if (!event) {
        res.status(400).send(`Invalid event ID ${req.params.id}`);
        return;
    }
    let name = req.body.name;
    if (isValidInput(name)) {
        res.status(400).send("Name is required and should be minimum of 3 characters");
        return;
    }
    if (event.users.has(name)) {
        res.status(400).send(`"${req.body.name}" name already exists`);
        return;
    }
    event.users.set(name, [1, 2, 3]);
    res.status(200).send({ name: name, dates: event.users.get(name) });
});

router.route("/:id/users/:uid").put((req, res) => {});

module.exports = router;
