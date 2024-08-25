import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { generateNRandomId } from "../utils";
import { User } from "../interfaces/user";
import { GetErrorMessages, InsertErrorMessages } from "../errors";

export class UserController {
    async getUsersFromEvent(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
            const users: User[] = await UserService.getUsersFromEvent(parseInt(eventId));
            res.status(200).json({
                users: users.map(({ userId, name }) => ({
                    userId,
                    name,
                })),
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message, message: GetErrorMessages.GET_FAILED });
        }
    }

    async createUser(req: Request, res: Response) {
        const { eventId } = req.params;
        const { name } = req.body;
        try {
            if (!(eventId && name) && !isNaN(parseInt(eventId))) {
                res.status(400).json({ error: "Bad Request", message: InsertErrorMessages.MISSING_PARAMETERS });
                return;
            }
            const userId = generateNRandomId(8);
            await UserService.createUser(userId, parseInt(eventId), name);
            res.status(200).json({ message: "Successfully created new user", userId: userId });
        } catch (error: any) {
            switch (error.code) {
                case "ER_DUP_ENTRY":
                    res.status(409).json({
                        error: error.code,
                        message: InsertErrorMessages.DUPLICATE_ENTRY,
                    });
                    break;
                case "ER_NO_REFERENCED_ROW_2":
                    res.status(404).json({ error: error.code, message: GetErrorMessages.RECORD_NOT_FOUND });
                    break;
                default:
                    res.status(500).json({ error: error.code, message: error.message });
            }
        }
    }
}
