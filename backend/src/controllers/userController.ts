import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { isValidIdString } from "../utils";
import { User } from "../interfaces/user";
import { GeneralErrorMessages, handleErrorResponse } from "../errors";
import { BadRequestError } from "../errors/errors";
import { CreateUser, CreateUserSchema } from "../schemas/UserRouteSchema";

export class UserController {
    async getUsersFromEvent(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
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
        try {
            const result = CreateUserSchema.safeParse(req.body);
            if (!result.success) {
                throw new BadRequestError(GeneralErrorMessages.MISSING_INVALID_PARAMETERS);
            }
            const body: CreateUser = result.data;
            const userId = await UserService.createUser(Number(eventId), body.name);
            return res.status(200).json({ message: "Successfully created new user", userId: userId });
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }
}
