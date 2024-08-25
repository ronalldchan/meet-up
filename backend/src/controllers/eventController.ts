import { getMinutes, isAfter, isValid } from "date-fns";
import { Request, Response } from "express";
import { EventService } from "../services/eventService";
import { dateFormat, generateNRandomId, getUtcDateTime, isValidInput, timeFormat } from "../utils";
import { Event } from "../interfaces/event";
import { formatInTimeZone } from "date-fns-tz";
import { ErrorCodes, GetErrorMessages, InsertErrorMessages } from "../errors";

export class EventController {
    async createEvent(req: Request, res: Response) {
        const { name, startDate, endDate, startTime, endTime, timezone } = req.body;
        try {
            if (!(name && startDate && endDate && startTime && endTime && timezone)) {
                res.status(400).json({
                    error: ErrorCodes.BAD_REQUEST,
                    message: InsertErrorMessages.MISSING_PARAMETERS,
                });
                return;
            }
            if (isValidInput(name)) {
                res.status(400).json({
                    error: ErrorCodes.BAD_REQUEST,
                    message: "Name should be minimum of 3 characters",
                });
                return;
            }
            let eventId: number = generateNRandomId(8);
            let parsedStartDate: Date = getUtcDateTime(startDate, startTime, timezone);
            let parsedEndDate: Date = getUtcDateTime(endDate, endTime, timezone);
            if (
                !isValid(parsedStartDate) ||
                !isValid(parsedEndDate) ||
                !isAfter(parsedEndDate, parsedStartDate) ||
                getMinutes(parsedStartDate) % 15 != 0 ||
                getMinutes(parsedEndDate) % 15 != 0
            ) {
                res.status(400).json({
                    error: ErrorCodes.BAD_REQUEST,
                    message: InsertErrorMessages.INVALID_DATETIME,
                });
                return;
            }
            await EventService.createEvent(
                eventId,
                name,
                formatInTimeZone(parsedStartDate, "UTC", dateFormat),
                formatInTimeZone(parsedEndDate, "UTC", dateFormat),
                formatInTimeZone(parsedStartDate, "UTC", timeFormat),
                formatInTimeZone(parsedEndDate, "UTC", timeFormat),
                timezone
            );
            res.status(201).json({ message: "Event created successfully", eventId: eventId });
        } catch (error: any) {
            switch (error.code) {
                case "ER_DUP_ENTRY":
                    res.status(409).json({
                        error: ErrorCodes.INSERT_DUPLICATE,
                        message: InsertErrorMessages.DUPLICATE_ENTRY,
                    });
                    return;
                default:
                    res.status(500).json({ error: error.code, message: error.message });
                    return;
            }
        }
    }

    async getEvent(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
            const eventRow: Event | null = await EventService.getEvent(parseInt(eventId));
            if (eventRow == null) {
                res.status(404).json({ error: ErrorCodes.GET_NOT_FOUND, message: GetErrorMessages.RECORD_NOT_FOUND });
                return;
            }
            res.status(200).json(eventRow);
            // const userRows: User[] = await UserService.getUsersFromEvent(parseInt(eventId));
            // res.status(200).json({ ...eventRow, users: userRows.map(({ userId, name }) => ({ userId, name })) });
        } catch (error: any) {
            res.status(500).json({ error: error.code, message: GetErrorMessages.GET_FAILED });
        }
    }
}
