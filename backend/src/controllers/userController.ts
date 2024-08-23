import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { generateNRandomId } from "../utils";

export class UserController {
    async getUsersFromEvent(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
            res.status(200).json(
                (await UserService.getUsersFromEvent(parseInt(eventId))).map(({ userId, name }) => ({
                    userId,
                    name,
                }))
            );
        } catch (error) {
            res.status(500).json({ error: "Failed to get users from event" });
        }
    }

    async createUser(req: Request, res: Response) {
        const { eventId } = req.params;
        const { name } = req.body;
        try {
            if (!(eventId && name) && !isNaN(parseInt(eventId))) {
                res.status(400).json({ error: "Bad Request", message: "Required parameters are missing" });
                return;
            }
            const userId = generateNRandomId(8);
            const result = await UserService.createUser(userId, parseInt(eventId), name);
            if (!result) {
                res.status(400).json({ error: "Failed to create new user" });
            }
            res.status(200).json({ message: "Successfully created new user", userId: userId });
        } catch (error: any) {
            console.log(error);
            switch (error.code) {
                case "ER_DUP_ENTRY":
                    res.status(409).json({
                        error: error.code,
                        message: "Failed to create user, duplicate entry detected",
                    });
                    break;
                case "ER_NO_REFERENCED_ROW_2":
                    res.status(404).json({ error: error.code, message: `No event with ID ${eventId}` });
                    break;
                default:
                    res.status(500).json({ error: error.code, message: error.message });
            }
        }
    }
}
