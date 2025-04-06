import { Request, Response } from "express";
import { EventService } from "../services/eventService";
import { Event } from "../interfaces/event";
import { GeneralErrorMessages, handleErrorResponse } from "../errors";
import { isValidTimezone, parseTime } from "../utils";
import { BadRequestError } from "../errors/customErrors";
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
            const parsedDates: Date[] = [...new Set(body.dates)].map((val) => new Date(val));
            // if (new Set(body.dates).size < body.dates.length) throw new BadRequestError("Duplicate dates detected.");
            const parsedStartTime: Date = parseTime(body.startTime);
            const parsedEndTime: Date = parseTime(body.endTime);
            if (
                parsedDates.some((val) => !isValid(val)) ||
                !isValid(parsedStartTime) ||
                !isValid(parsedEndTime) ||
                !isValidTimezone(body.timezone)
            )
                throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
            const eventId = await EventService.createEvent(
                body.name,
                parsedDates,
                parsedStartTime,
                parsedEndTime,
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
            const eventRow: Event = await EventService.getEvent(eventId);
            return res.status(200).json(eventRow);
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }
}
