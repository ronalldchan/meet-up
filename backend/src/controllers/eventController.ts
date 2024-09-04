import { Request, Response } from "express";
import { EventService } from "../services/eventService";
import { Event } from "../interfaces/event";
import { GeneralErrorMessages, handleErrorResponse } from "../errors";
import { isValidTimezone, parseDateTime } from "../utils";
import { BadRequestError } from "../errors/errors";
import { isValid } from "date-fns";
import { CreateEvent, createEventSchema } from "../schemas/EventRouteSchema";

export class EventController {
    async createEvent(req: Request, res: Response) {
        try {
            const result = createEventSchema.safeParse(req.body);
            if (!result.success) {
                throw new BadRequestError(GeneralErrorMessages.MISSING_INVALID_PARAMETERS);
            }
            const body: CreateEvent = result.data;
            const parsedStartDateTime = parseDateTime(body.startDate + " " + body.startTime);
            const parsedEndDateTime = parseDateTime(body.endDate + " " + body.endTime);
            if (!isValid(parsedStartDateTime) || !isValid(parsedEndDateTime) || !isValidTimezone(body.timezone))
                throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
            const eventId = await EventService.createEvent(
                body.name,
                parsedStartDateTime,
                parsedEndDateTime,
                body.timezone
            );
            return res.status(201).json({ message: "Event created successfully", eventId: eventId });
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }

    async getEvent(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
            const eventRow: Event = await EventService.getEvent(Number(eventId));
            return res.status(200).json(eventRow);
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }
}
