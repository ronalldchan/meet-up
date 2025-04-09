import { Request, Response, NextFunction } from "express";
import { isValidIdString } from "../utils";
import { BadRequestError } from "../errors/customErrors";

export const validateEventId = (req: Request, res: Response, next: NextFunction, eventId: string) => {
    if (!isValidIdString(eventId)) {
        return res.status(400).json({ error: BadRequestError.name, message: "Event ID is not in the proper format" });
    }
    next();
};

export const validateUserId = (req: Request, res: Response, next: NextFunction, userId: string) => {
    if (!isValidIdString(userId)) {
        return res.status(400).json({ error: BadRequestError.name, message: "User ID is not in the proper format" });
    }
    next();
};
