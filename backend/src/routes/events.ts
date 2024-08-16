import express, { Request, Response } from "express";
import pool from "../db";
import { parse, isValid, getMinutes, isAfter } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

const router = express.Router();
const datetimeFormat: string = "yyyy-MM-dd HH:mm";

function generateNRandomId(n: number) {
    const min = Math.pow(10, n - 1);
    const max = Math.pow(10, n) - 1;
    return Math.floor(min + Math.random() * (max - min + 1));
}

function isValidInput(input: string): boolean {
    return !input || input.length < 3;
}

router
    .route("/")
    .get(async (req: Request, res: Response) => {
        try {
            const [rows] = await pool.query("SELECT * FROM events");
            res.status(200).json(rows);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    })
    .post(async (req: Request, res: Response) => {
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
            let event_id: number = generateNRandomId(8);
            let parsedStartDate: Date = parse(start, datetimeFormat, new Date());
            let parsedEndDate: Date = parse(end, datetimeFormat, new Date());
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
            let utcStartDateTime: Date = fromZonedTime(parsedStartDate, timezone);
            let utcEndDateTime: Date = fromZonedTime(parsedEndDate, timezone);
            if (!isValid(utcStartDateTime) || !isValid(utcEndDateTime)) {
                res.status(400).json({ error: "Invalid timezone information" });
                return;
            }
            const sql: string = "insert into events values (?, ?, ?, ?, ?)";
            await pool.query(sql, [event_id, name, start, end, timezone]);
            res.status(201).json({ message: "Event created successfully", event_id: event_id });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.route("/:id").get(async (req: Request, res: Response) => {
    try {
        const eventSql = "SELECT * FROM events where event_id = ?";
        const [eventRows]: any[] = await pool.query(eventSql, [req.params.id]);
        if (eventRows.length == 0) {
            res.status(404).json({ error: "Resource not found" });
        }
        const userSql = "SELECT user_id, name from users where event_id = ?";
        const [userRows] = await pool.query(userSql, [req.params.id]);
        res.status(200).json({ ...eventRows[0], users: userRows });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router
    .route("/:id/users")
    .get(async (req: Request, res: Response) => {
        try {
            const sql = "SELECT * FROM users where event_id = ?";
            const [result] = await pool.query(sql, [req.params.id]);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    })
    .post(async (req: Request, res: Response) => {
        try {
            const sql: string = "insert into users values (?, ?, ?)";
            const name: string = req.body.name;
            const user_id: number = generateNRandomId(8);
            const event_id: number = parseInt(req.params.id);
            await pool.query(sql, [user_id, event_id, name]);
            res.status(200).json({
                message: "User added successfully",
                data: { user_id: user_id, event_id: event_id, name: name },
            });
        } catch (error: any) {
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

router.route("/:id/users/:user_id").get(async (req: Request, res: Response) => {
    try {
        const userSql = "SELECT * FROM users where user_id = ?";
        const availSql = "select available from availability where user_id = ?";
        const [userRows]: any[] = await pool.query(userSql, [req.params.user_id]);
        if (userRows.length == 0) {
            res.status(404).json({ error: "Resource not found" });
        }
        const [availRows]: any[] = await pool.query(availSql, [req.params.user_id]);
        const availability: string[] = availRows.map((val: any) => val.available);
        res.status(200).json({ ...userRows[0], availability: availability });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
