import pool from "../db";
import { UserService } from "./userService";
import { EventService } from "./eventService";
import { User } from "../interfaces/user";
import { BadRequestError, NotFoundError } from "../errors/customErrors";
import { formatInTimeZone } from "date-fns-tz";
import { Event } from "../interfaces/event";
import { datetimeFormat, localTimeAsUTC, parseTime } from "../utils";
import { GeneralErrorMessages } from "../errors";
import { FieldPacket, RowDataPacket } from "mysql2";
import { Availability, getSqlAvailabilityStruct } from "../interfaces/availability";
import { isBefore, isSameMinute } from "date-fns";
import { GetEvent } from "../schemas/EventRouteSchema";
import { PoolConnection } from "mysql2/promise";

export class AvailabilityService {
    static async updateAvailability(eventId: string, userId: string, availability: Date[]) {
        const event: GetEvent = await EventService.getEvent(eventId);
        const user: User = await UserService.getUser(userId);
        if (user.eventId != eventId) {
            throw new NotFoundError("User ID does not belong to event.");
        }
        // check if its 30 minute intervals
        if (availability.some((date) => date.getUTCMinutes() % 30 != 0)) {
            throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
        }
        // check if the availabilities are within the earliest start and latest end of each day
        const eventStartTime: Date = localTimeAsUTC(parseTime(event.startTime));
        const eventEndTime: Date = localTimeAsUTC(parseTime(event.endTime));

        const eventStartDates: Date[] = event.dates.map((dateIso) => {
            let date = new Date(dateIso);
            date.setUTCHours(eventStartTime.getUTCHours(), eventStartTime.getUTCMinutes());
            return date;
        });

        const eventEndDates: Date[] = event.dates.map((dateIso) => {
            let date = new Date(dateIso);
            date.setUTCHours(eventEndTime.getUTCHours(), eventEndTime.getUTCMinutes());
            return date;
        });

        availability.every((avail) => {
            for (let i = 0; i < eventStartDates.length; i++) {
                const start = eventStartDates[i];
                const end = eventEndDates[i];
                if ((isBefore(start, avail) && isBefore(avail, end)) || isSameMinute(avail, start)) return true;
            }
            throw new BadRequestError("Datetimes are not within event range.");
        });

        // the final values to insert into db
        const parsedUtcAvailability: string[] = availability.map((date) =>
            formatInTimeZone(date, "UTC", datetimeFormat)
        );

        /**
         * mysql portion of updating the database
         */
        const connection: PoolConnection = await pool.getConnection();

        try {
            await connection.beginTransaction();
            if (parsedUtcAvailability.length > 0) {
                await connection.query("DELETE FROM availability WHERE user_id = ? AND available NOT IN (?)", [
                    userId,
                    parsedUtcAvailability,
                ]);
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

    static async getAvailability(eventId: string): Promise<Availability[]> {
        const event: Event = await EventService.getEvent(eventId);
        const sql = "SELECT A.* FROM availability a JOIN users u ON a.user_id = u.user_id WHERE u.event_id = ?";
        const [rows]: [RowDataPacket[], FieldPacket[]] = await pool.execute(sql, [eventId]);
        return rows.map((data) => getSqlAvailabilityStruct(data));
    }
}
