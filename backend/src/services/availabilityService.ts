import pool from "../db";
import { UserService } from "./userService";
import { EventService } from "./eventService";
import { User } from "../interfaces/user";
import { BadRequestError, NotFoundError } from "../errors/customErrors";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { Event } from "../interfaces/event";
import { datetimeFormat, parseTime } from "../utils";
import { GeneralErrorMessages } from "../errors";
import { FieldPacket, RowDataPacket } from "mysql2";
import { Availability, getSqlAvailabilityStruct } from "../interfaces/availability";
import { isAfter, isBefore, isSameMinute, set } from "date-fns";
import { GetEvent } from "../schemas/EventRouteSchema";
import { PoolConnection } from "mysql2/promise";

export class AvailabilityService {
    static async addAvailability(eventId: number, userId: number, localAvailability: Date[], timezone: string) {
        const event: GetEvent = await EventService.getEvent(eventId);
        const user: User = await UserService.getUser(userId);
        if (user.eventId != eventId) {
            throw new NotFoundError("User ID does not belong to event.");
        }
        const utcAvailability: Date[] = localAvailability.map((date) => fromZonedTime(date, timezone));
        if (utcAvailability.some((date) => date.getUTCMinutes() % 15 != 0)) {
            throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
        }
        const eventStartTime: Date = fromZonedTime(parseTime(event.startTime), "utc");
        const eventEndTime: Date = fromZonedTime(parseTime(event.endTime), "utc");
        const eventStartDates: Date[] = event.dates.map((date) =>
            fromZonedTime(
                set(date, { hours: eventStartTime.getUTCHours(), minutes: eventStartTime.getUTCMinutes() }),
                "utc"
            )
        );
        const eventEndDates: Date[] = event.dates.map((date) =>
            fromZonedTime(
                set(date, { hours: eventEndTime.getUTCHours(), minutes: eventEndTime.getUTCMinutes() }),
                "utc"
            )
        );
        if (isAfter(eventStartTime, eventEndTime)) {
            // this is because UTC conversion
            eventEndDates.forEach((date) => date.setDate(date.getDate() + 1));
        }
        const allWithinRange: boolean = utcAvailability.every((avail) => {
            for (let i = 0; i < eventStartDates.length; i++) {
                const start = eventStartDates[i];
                const end = eventEndDates[i];
                if ((isBefore(start, avail) && isBefore(avail, end)) || isSameMinute(avail, start)) return true;
            }
            return false;
        });
        if (!allWithinRange) {
            throw new BadRequestError("Datetimes are not within event range.");
        }
        const parsedUtcAvailability: string[] = utcAvailability.map((date) =>
            formatInTimeZone(date, "UTC", datetimeFormat)
        );
        console.log(parsedUtcAvailability);
        const sql = "INSERT IGNORE INTO availability (user_id, available) VALUES ?";
        const values = parsedUtcAvailability.map((a) => [userId, a]);
        console.log(values);
        await pool.query(sql, [values]);
    }

    static async removeAvailability(eventId: number, userId: number, localAvailability: Date[], timezone: string) {
        const event: Event = await EventService.getEvent(eventId);
        const user: User = await UserService.getUser(userId);
        if (user.eventId != eventId) throw new NotFoundError("User ID does not belong to event.");
        const utcAvailability: Date[] = localAvailability.map((date) => fromZonedTime(date, timezone));
        if (utcAvailability.some((date) => date.getUTCMinutes() % 15 != 0)) {
            throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
        }
        // const eventStart = fromZonedTime(parseDateTime(event.startDate + " " + event.startTime), "utc");
        // const eventEnd = fromZonedTime(parseDateTime(event.endDate + " " + event.endTime), "utc");
        // if (utcAvailability.some((date) => !isWithinEventRange(date, eventStart, eventEnd))) {
        //     throw new BadRequestError("Datetimes are not within event range.");
        // }
        const parsedUtcAvailability: string[] = utcAvailability.map((date) =>
            formatInTimeZone(date, "UTC", datetimeFormat)
        );
        const sql = "DELETE FROM availability WHERE user_id = ? and available IN (?)";
        await pool.query(sql, [userId, parsedUtcAvailability]);
    }

    static async updateAvailability(eventId: number, userId: number, availability: Date[], timezone: string) {
        console.log("got here");
        const event: GetEvent = await EventService.getEvent(eventId);
        const user: User = await UserService.getUser(userId);
        if (user.eventId != eventId) {
            throw new NotFoundError("User ID does not belong to event.");
        }
        const utcAvailability: Date[] = availability.map((date) => fromZonedTime(date, timezone));
        // check if its 30 minute intervals
        if (utcAvailability.some((date) => date.getUTCMinutes() % 30 != 0)) {
            throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
        }
        // check if the availabilities are within the earliest start and latest end of each day
        const eventStartTime: Date = fromZonedTime(parseTime(event.startTime), "utc");
        const eventEndTime: Date = fromZonedTime(parseTime(event.endTime), "utc");
        const eventStartDates: Date[] = event.dates.map((date) =>
            fromZonedTime(
                set(date, { hours: eventStartTime.getUTCHours(), minutes: eventStartTime.getUTCMinutes() }),
                "utc"
            )
        );
        const eventEndDates: Date[] = event.dates.map((date) =>
            fromZonedTime(
                set(date, { hours: eventEndTime.getUTCHours(), minutes: eventEndTime.getUTCMinutes() }),
                "utc"
            )
        );
        // if (isAfter(eventStartTime, eventEndTime)) {
        //     // this is because UTC conversion
        //     eventEndDates.forEach((date) => date.setDate(date.getDate() + 1));
        // }
        utcAvailability.every((avail) => {
            for (let i = 0; i < eventStartDates.length; i++) {
                const start = eventStartDates[i];
                const end = eventEndDates[i];
                if ((isBefore(start, avail) && isBefore(avail, end)) || isSameMinute(avail, start)) return true;
            }
            throw new BadRequestError("Datetimes are not within event range.");
        });

        // the final values to insert into db
        const parsedUtcAvailability: string[] = utcAvailability.map((date) =>
            formatInTimeZone(date, "UTC", datetimeFormat)
        );

        console.log("got to sql part");
        /**
         * mysql portion of updating the database
         */
        const connection: PoolConnection = await pool.getConnection();
        console.log(parsedUtcAvailability);
        try {
            console.log("start transaction");
            await connection.beginTransaction();
            if (parsedUtcAvailability.length > 0) {
                console.log("deleting the stuff");

                await connection.query("DELETE FROM availability WHERE user_id = ? AND available NOT IN (?)", [
                    userId,
                    parsedUtcAvailability,
                ]);
                console.log("adding the stuff");
                await connection.query("INSERT IGNORE INTO availability (user_id, available) VALUES ?", [
                    parsedUtcAvailability.map((value) => [userId, value]),
                ]);
            } else {
                await connection.query("DELETE FROM availability WHERE user_id = ?", [userId]);
            }
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw new Error("failed to update availability");
        } finally {
            connection.release();
        }
        console.log("done");
    }

    static async getAvailability(eventId: number): Promise<Availability[]> {
        const event: Event = await EventService.getEvent(eventId);
        const sql = "SELECT A.* FROM availability a JOIN users u ON a.user_id = u.user_id WHERE u.event_id = ?";
        const [rows]: [RowDataPacket[], FieldPacket[]] = await pool.query(sql, [eventId]);
        return rows.map((data) => getSqlAvailabilityStruct(data));
    }
}
