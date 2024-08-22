import { getMinutes, isAfter, isValid } from "date-fns";
import { Request, Response } from "express";
import { EventService } from "../services/eventService";
import { datetimeFormat, generateNRandomId, getUtcDateTime } from "../utils";
import { UserService } from "../services/userService";
import { Event } from "../interfaces/event";
import { User } from "../interfaces/user";

function isValidInput(input: string): boolean {
    return !input || input.length < 3;
}

export class EventController {
    async createEvent(req: Request, res: Response) {
        const { name, startDate, endDate, timezone } = req.body;
        try {
            if (!(name && startDate && endDate && timezone)) {
                res.status(400).json({ error: "Bad Request", message: "Required parameters are missing" });
                return;
            }
            if (isValidInput(name)) {
                res.status(400).json({ error: "Bad Request", message: "Name should be minimum of 3 characters" });
                return;
            }
            let eventId: number = generateNRandomId(8);
            let parsedStartDate: Date = getUtcDateTime(startDate, timezone);
            let parsedEndDate: Date = getUtcDateTime(endDate, timezone);
            if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
                res.status(400).json({
                    error: "Bad Rquest",
                    message: `Invalid datetime or timezone, should be in the following format '${datetimeFormat}' and 'America/New_York'`,
                });
                return;
            }
            if (!isAfter(parsedEndDate, parsedStartDate)) {
                res.status(400).json({ error: "Bad Request", message: "End date should be after start date" });
                return;
            }
            if (getMinutes(parsedStartDate) % 15 != 0 || getMinutes(parsedEndDate) % 15 != 0) {
                res.status(400).json({ error: "Bad Request", message: "Datetime should be modulo of 15 minutes" });
                return;
            }
            await EventService.createEvent(eventId, name, startDate, endDate, timezone);
            res.status(201).json({ message: "Event created successfully", eventId: eventId });
        } catch (error: any) {
            switch (error.code) {
                case "ER_DUP_ENTRY":
                    res.status(409).json({
                        error: error.code,
                        message: "Failed to create event, duplicate entry detected",
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
            const eventRow: Event = await EventService.getEvent(parseInt(eventId));
            const userRows: User[] = await UserService.getUsersFromEvent(parseInt(eventId));
            res.status(200).json({ ...eventRow, users: userRows.map(({ userId, name }) => ({ userId, name })) });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
