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
                res.status(400).json({ error: "Body requires name, startDate, endDate, timezone" });
                return;
            }
            if (isValidInput(name)) {
                res.status(400).json({ error: "Name is required and should be minimum of 3 characters" });
                return;
            }
            let eventId: number = generateNRandomId(8);
            let parsedStartDate: Date = getUtcDateTime(startDate, timezone);
            let parsedEndDate: Date = getUtcDateTime(endDate, timezone);
            if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
                res.status(400).json({
                    error: `Invalid datetime or timezone, should be in the following format '${datetimeFormat}' and 'America/New_York'`,
                });
                return;
            }
            if (!isAfter(parsedEndDate, parsedStartDate)) {
                res.status(400).json({ error: "End date should be after start date" });
                return;
            }
            if (getMinutes(parsedStartDate) % 15 != 0 || getMinutes(parsedEndDate) % 15 != 0) {
                res.status(400).json({ error: "Datetime should be modulo of 15 minutes" });
                return;
            }
            if (!(await EventService.createEvent(eventId, name, startDate, endDate, timezone)))
                throw new Error("Failed to create event");
            res.status(201).json({ message: "Event created successfully", event_id: eventId });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getEvent(req: Request, res: Response) {
        try {
            const eventRow: Event = await EventService.getEvent(parseInt(req.params.id));
            const userRows: User[] = await UserService.getUsersFromEvent(parseInt(req.params.id));
            res.status(200).json({ ...eventRow, users: userRows.map(({ userId, name }) => ({ userId, name })) });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
