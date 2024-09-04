import { FieldPacket, ResultSetHeader } from "mysql2";
import pool from "../db";
import { UserService } from "./userService";
import { EventService } from "./eventService";
import { User } from "../interfaces/user";
import { BadRequestError, NotFoundError } from "../errors/errors";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { Event } from "../interfaces/event";
import { datetimeFormat, isWithinEventRange, parseDateTime } from "../utils";
import { GeneralErrorMessages } from "../errors";

export class AvailabilityService {
    static async addAvailability(eventId: number, userId: number, localAvailability: Date[], timezone: string) {
        const event: Event = await EventService.getEvent(eventId);
        const user: User = await UserService.getUser(userId);
        if (user.eventId != eventId) {
            throw new NotFoundError("User ID does not belong to event.");
        }
        const utcAvailability: Date[] = localAvailability.map((date) => fromZonedTime(date, timezone));
        if (utcAvailability.some((date) => date.getUTCMinutes() % 15 != 0)) {
            throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
        }
        const eventStart = fromZonedTime(parseDateTime(event.startDate + " " + event.startTime), "utc");
        const eventEnd = fromZonedTime(parseDateTime(event.endDate + " " + event.endTime), "utc");
        if (utcAvailability.some((date) => !isWithinEventRange(date, eventStart, eventEnd))) {
            throw new BadRequestError("Datetimes are not within event range.");
        }
        const parsedUtcAvailability: string[] = utcAvailability.map((date) =>
            formatInTimeZone(date, "UTC", datetimeFormat)
        );
        const sql = "INSERT IGNORE INTO availability (user_id, available) VALUES ?";
        const values = parsedUtcAvailability.map((a) => [userId, a]);
        await pool.query(sql, [values]);
    }

    static async removeAvailability(
        eventId: number,
        userId: number,
        localAvailability: Date[],
        timezone: string
    ): Promise<boolean> {
        const sql = "DELETE FROM availability WHERE user_id = ? and availability = ?";
        try {
            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query(sql, [userId, localAvailability]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error("Database deletion failed");
        }
    }
}
