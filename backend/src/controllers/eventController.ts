import { Request, Response } from "express";
import { EventService } from "../services/eventService";
import { Event } from "../interfaces/event";
import { BadRequestError, GeneralErrorMessages, GetErrorMessages, NotFoundError, ValidationError } from "../errors";

export class EventController {
    async createEvent(req: Request, res: Response) {
        const { name, startDate, endDate, startTime, endTime, timezone } = req.body;
        try {
            if (!(name && startDate && endDate && startTime && endTime && timezone)) {
                throw new BadRequestError(GeneralErrorMessages.MISSING_INVALID_PARAMETERS);
            }
            const eventId = await EventService.createEvent(name, startDate, endDate, startTime, endTime, timezone);
            return res.status(201).json({ message: "Event created successfully", eventId: eventId });
        } catch (error: any) {
            switch (true) {
                case error instanceof BadRequestError:
                case error instanceof ValidationError:
                    res.status(400).json({
                        error: error.name,
                        message: error.message,
                    });
                    break;
                default:
                    return res.status(500).json({ error: error.name, message: error.message });
            }
            return res.json({ error: error.name, message: error.message });
        }
    }

    async getEvent(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
            const eventIdRegex: RegExp = /^[1-9][0-9]*$/;
            if (!eventIdRegex.test(eventId)) {
                throw new BadRequestError(GeneralErrorMessages.MISSING_INVALID_PARAMETERS);
            }
            const eventRow: Event = await EventService.getEvent(Number(eventId));
            return res.status(200).json(eventRow);
        } catch (error: any) {
            switch (true) {
                case error instanceof BadRequestError:
                    res.status(400);
                    break;
                case error instanceof NotFoundError:
                    res.status(404);
                    break;
                default:
                    return res.status(500).json({ error: error.name, message: GeneralErrorMessages.UNKNOWN });
            }
            return res.json({ error: error.name, message: error.message });
        }
    }
}
