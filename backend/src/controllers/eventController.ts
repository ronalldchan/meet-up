import { Request, Response } from "express";
import { EventService } from "../services/eventService";
import { Event } from "../interfaces/event";
import { BadRequestError, GeneralErrorMessages, handleErrorResponse } from "../errors";
import { isValidIdString } from "../utils";

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
            handleErrorResponse(error, res);
        }
    }

    async getEvent(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
            if (!isValidIdString(eventId)) {
                throw new BadRequestError(GeneralErrorMessages.MISSING_INVALID_PARAMETERS);
            }
            const eventRow: Event = await EventService.getEvent(Number(eventId));
            return res.status(200).json(eventRow);
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }
}
