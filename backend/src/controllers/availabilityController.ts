import { Request, Response } from "express";
import { AvailabilityService } from "../services/availabilityService";
import { UserService } from "../services/userService";
import { User } from "../interfaces/user";
import { datetimeFormat, getDateTime, isWithinEventRange } from "../utils";
import { isValid } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ErrorCodes, GetErrorMessages, InsertErrorMessages } from "../errors";
import { EventService } from "../services/eventService";
import { Event } from "../interfaces/event";

export class AvailabilityController {
    async addAvailability(req: Request, res: Response) {
        const { eventId, userId } = req.params;
        const { availability, timezone }: { availability: string[]; timezone: string } = req.body;
        try {
            const parsedEventId = parseInt(eventId);
            const parsedUserId = parseInt(userId);
            const event: Event | null = await EventService.getEvent(parsedEventId);
            if (!event) {
                res.status(404).json({ error: ErrorCodes.BAD_REQUEST, message: GetErrorMessages.RECORD_NOT_FOUND });
                return;
            }
            const user: User = await UserService.getUser(parsedUserId);
            if (user.eventId != parsedEventId) {
                res.status(400).json({ error: ErrorCodes.BAD_REQUEST, message: "User not part of this event" });
                return;
            }
            const parsedAvailability: Date[] = availability.map((avail) => fromZonedTime(getDateTime(avail), timezone));
            if (parsedAvailability.some((date) => !isValid(date))) {
                res.status(400).json({
                    error: ErrorCodes.BAD_REQUEST,
                    message: InsertErrorMessages.INVALID_DATETIME,
                });
                return;
            }
            const eventStart = getDateTime(event.startDate + " " + event.startTime);
            const eventEnd = getDateTime(event.endDate + " " + event.endTime);
            if (parsedAvailability.some((date) => !isWithinEventRange(eventStart, eventEnd, date))) {
                res.status(400).json({
                    error: ErrorCodes.BAD_REQUEST,
                    message: "Datetimes are not within event range",
                });
            }
            const parsedUtcAvailability: string[] = parsedAvailability.map((pa) =>
                formatInTimeZone(pa, "UTC", datetimeFormat)
            );
            await AvailabilityService.addAvailability(parseInt(userId), parsedUtcAvailability);

            res.status(200).json({ message: "Successfully added availability" });
        } catch (error: any) {
            res.status(500).json({ error: "Failed to insert availability", message: error.message });
        }
    }

    async removeAvailability(req: Request, res: Response) {
        const { eventId, userId } = req.params;
        const { availability }: { availability: string[] } = req.body;
    }
}
