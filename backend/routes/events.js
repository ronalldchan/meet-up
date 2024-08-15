const express = require("express");
const router = express.Router();
const pool = require("../db");
const { parse, isValid, getMinutes, isAfter } = require("date-fns");
const { fromZonedTime } = require("date-fns-tz");

const datetimeFormat = "yyyy-MM-dd HH:mm";

function generateNRandomId(n) {
    const min = Math.pow(10, n - 1);
    const max = Math.pow(10, n) - 1;
    return Math.floor(min + Math.random() * (max - min + 1));
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
            if (!(req.body.name && req.body.startDate && req.body.endDate && req.body.timezone)) {
                res.status(400).json({ error: "Missing body information" });
                return;
            }
            const name = req.body.name;
            const start = req.body.startDate;
            const end = req.body.endDate;
            const timezone = req.body.timezone;
            if (isValidInput(name)) {
                res.status(400).json({ error: "Name is required and should be minimum of 3 characters" });
                return;
            }
            let event_id = generateNRandomId(8);
            let parsedStartDate = parse(start, datetimeFormat, new Date());
            let parsedEndDate = parse(end, datetimeFormat, new Date());
            if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
                res.status(400).json({
                    error: `Invalid datetime, should be in the following format "${datetimeFormat}"`,
                });
                return;
            }
            if (!isAfter(parsedEndDate, parsedStartDate)) {
                res.status(400).json({ error: "End date should be after start date" });
                return;
            }
            if (getMinutes(parsedStartDate) % 15 != 0 || getMinutes(parsedEndDate) % 15 != 0) {
                res.status(400).json({ error: "Datetime should be modulo of 15 minutes" });
                return;
            }
            let utcStartDateTime = fromZonedTime(parsedStartDate, timezone);
            let utcEndDateTime = fromZonedTime(parsedEndDate, timezone);
            if (!isValid(utcStartDateTime) || !isValid(utcEndDateTime)) {
                res.status(400).json({ error: "Invalid timezone information" });
                return;
            }
            const sql = "insert into events values (?, ?, ?, ?, ?)";
            await pool.query(sql, [event_id, name, start, end, timezone]);
            res.status(201).json({ message: "Event created successfully", event_id: event_id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

router.route("/:id").get(async (req, res) => {
    try {
        const sql = "SELECT * FROM events where event_id = ? limit 1";
        const [result] = await pool.query(sql, [req.params.id]);
        if (result.length < 1) {
            res.status(404).json({ error: "Could not find event with that ID" });
        }
        res.status(200).json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router
    .route("/:id/users")
    .get(async (req, res) => {
        try {
            const sql = "SELECT * FROM users where event_id = ?";
            const [result] = await pool.query(sql, [req.params.id]);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
    .post(async (req, res) => {
        try {
            const sql = "insert into users values (?, ?, ?)";
            const name = req.body.name;
            const user_id = generateNRandomId(8);
            const event_id = parseInt(req.params.id);
            await pool.query(sql, [user_id, event_id, name]);
            res.status(200).json({
                message: "User added successfully",
                data: { user_id: user_id, event_id: event_id, name: name },
            });
        } catch (error) {
            switch (error.code) {
                case "ER_DUP_ENTRY":
                    res.status(409).json({ error: "Duplicate entry detected" });
                    break;
                case "ER_NO_REFERENCED_ROW_2":
                    res.status(404).json({ error: `No event with ID ${req.params.id}` });
                    break;
                default:
                    res.status(500).json({ error: error.message });
            }
        }
    });

router.route("/:id/users/:uid").put((req, res) => {});

module.exports = router;
