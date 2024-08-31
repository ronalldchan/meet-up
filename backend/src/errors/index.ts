import { Response } from "express";
import { dateFormat, timeFormat } from "../utils";

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BadRequestError";
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DatabaseError";
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}

export class ConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConflictError";
    }
}

export function handleErrorResponse(error: Error, res: Response) {
    switch (true) {
        case error instanceof BadRequestError:
        case error instanceof ValidationError:
            res.status(400);
            break;
        case error instanceof DatabaseError:
            res.status(500);
            break;
        case error instanceof NotFoundError:
            res.status(404);
            break;
        case error instanceof ConflictError:
            res.status(409);
            break;
        default:
            return res.status(500);
    }
    return res.json({ error: error.name, message: error.message });
}

export const GeneralErrorMessages = {
    MISSING_INVALID_PARAMETERS: "Required parameters are missing or invalid.",
    UNKNOWN: "Unkown error occured. Please try again later.",
    INVALID_DATETIME: `Invalid date, time, or timezone. Date should be '${dateFormat}', time should be '${timeFormat}', timezone should be in IANA format`,
};
