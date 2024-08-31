import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { isValidIdString } from "../utils";
import { User } from "../interfaces/user";
import { BadRequestError, GeneralErrorMessages, handleErrorResponse } from "../errors";

export class UserController {
    async getUsersFromEvent(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
            if (!isValidIdString(eventId)) {
                throw new BadRequestError("Event ID should be a number");
            }
            const users: User[] = await UserService.getUsersFromEvent(Number(eventId));
            return res.status(200).json({
                users: users.map(({ userId, name }) => ({
                    userId,
                    name,
                })),
            });
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }

    async createUser(req: Request, res: Response) {
        const { eventId } = req.params;
        const { name } = req.body;
        try {
            if (!eventId || !name || !isValidIdString(eventId)) {
                throw new BadRequestError(GeneralErrorMessages.MISSING_INVALID_PARAMETERS);
            }
            const userId = await UserService.createUser(parseInt(eventId), name);
            return res.status(200).json({ message: "Successfully created new user", userId: userId });
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }
}
