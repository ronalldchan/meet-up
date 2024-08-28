import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { generateNRandomId } from "../utils";
import { User } from "../interfaces/user";
import { ErrorCodes, GetErrorMessages, InsertErrorMessages } from "../errors";
import { EventService } from "../services/eventService";
import { Event } from "../interfaces/event";

export class UserController {
    async getUsersFromEvent(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
            const parsedEventId: number = parseInt(eventId);
            if (isNaN(parsedEventId)) {
                res.status(400).json({
                    error: ErrorCodes.BAD_REQUEST,
                    message: "Event ID should be a number",
                });
                return;
            }
            const event: Event | null = await EventService.getEvent(parsedEventId);
            if (!event) {
                res.status(404).json({
                    error: ErrorCodes.GET_NOT_FOUND,
                    message: `Event with ID ${eventId} does not exist.`,
                });
                return;
            }
            const users: User[] = await UserService.getUsersFromEvent(parsedEventId);
            res.status(200).json({
                users: users.map(({ userId, name }) => ({
                    userId,
                    name,
                })),
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message, message: error.message });
        }
    }

    async createUser(req: Request, res: Response) {
        const { eventId } = req.params;
        const { name } = req.body;
        try {
            if (!eventId || !name || isNaN(parseInt(eventId))) {
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
                        error: ErrorCodes.INSERT_DUPLICATE,
                        message: InsertErrorMessages.DUPLICATE_ENTRY,
                    });
                    break;
                case "ER_NO_REFERENCED_ROW_2":
                    res.status(404).json({
                        error: ErrorCodes.INSERT_FAILED,
                        message: GetErrorMessages.RECORD_NOT_FOUND,
                    });
                    break;
                default:
                    res.status(500).json({ error: error.code, message: error.message });
            }
        }
    }
}
