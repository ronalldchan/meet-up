import express, { Request, Response } from "express";
import pool from "../db";
import { isValid } from "date-fns";
import { EventController } from "../controllers/eventController";
import { getUtcDateTime } from "../utils";
import { UserController } from "../controllers/userController";

const router = express.Router();

const eventController: EventController = new EventController();
const userController: UserController = new UserController();

router.route("/").post(eventController.createEvent);

router.route("/:eventId").get(eventController.getEvent);

router.route("/:eventId/users").get(userController.getUsersFromEvent).post(userController.createUser);

router
    .route("/:eventId/users/:userId")
    // .get(async (req: Request, res: Response) => {
    //     try {
    //         const userSql = "SELECT * FROM users WHERE user_id = ?";
    //         const availSql = "SELECT available FROM availability WHERE user_id = ?";
    //         const [userRows]: any[] = await pool.query(userSql, [req.params.user_id]);
    //         if (userRows.length == 0) {
    //             res.status(404).json({ error: "Resource not found" });
    //         }
    //         const [availRows]: any[] = await pool.query(availSql, [req.params.user_id]);
    //         const availability: string[] = availRows.map((val: any) => val.available);
    //         res.status(200).json({ ...userRows[0], availability: availability });
    //     } catch (error: any) {
    //         res.status(500).json({ error: error.message });
    //     }
    // })
    .put(async (req: Request, res: Response) => {
        const times: string[] = req.body.availability;
        const timezone: string = req.body.timezone;
        const dates: Date[] = times.map((time) => getUtcDateTime(time, timezone));
        if (dates.some((date: Date) => !isValid(date))) {
            res.status(400).json({ error: "Datetime or Timezone information is invalid" });
            return;
        }
        dates.forEach((date: Date) => {});
        const sql = "INSERT INTO availability (user_id, available) VALUES (?, ?)";
        const [rows]: any[] = await pool.query(sql, [req.params]);
    });

export default router;
