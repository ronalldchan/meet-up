import { Request, Response } from "express";
import { User } from "../interfaces/user";
import { UserService } from "../services/userService";

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
}
