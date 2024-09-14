import { FieldPacket, RowDataPacket } from "mysql2";
import pool from "../db";
import { Event, getSqlEventStruct } from "../interfaces/event";
import { dateFormat, generateNRandomId, isSameUtcDay, timeFormat } from "../utils";
import { GeneralErrorMessages } from "../errors";
import { getMinutes, isAfter, set } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ConflictError, DatabaseError, NotFoundError, ValidationError } from "../errors/errors";

export class EventService {
    static async getEvent(eventId: number): Promise<Event> {
        const sql = "SELECT * FROM events WHERE event_id = ?";
        const [rows]: [RowDataPacket[], FieldPacket[]] = await pool.query(sql, [eventId]);
        if (rows.length <= 0) throw new NotFoundError(`No event of ID ${eventId} was found.`);
        return getSqlEventStruct(rows[0]);
    }

    static async createEvent(
        name: string,
        dates: Date[],
        localStartTime: Date,
        localEndTime: Date,
        timezone: string
    ): Promise<number> {
        const eventId: number = generateNRandomId(8);
        const eventSql: string = "INSERT INTO events (event_id, name, start_time, end_time) VALUES (?, ?, ?, ?)";
        const eventDatesSql: string = "INSERT INTO event_dates (event_id, event_date) VALUES ?";
        if (
            !isAfter(localEndTime, localStartTime) ||
            getMinutes(localStartTime) % 15 != 0 ||
            getMinutes(localEndTime) % 15 != 0
        )
            throw new ValidationError(GeneralErrorMessages.INVALID_DATETIME);
        const storedDates: Date[] = []; // check all the dates if they span 2 days in utc
        dates.forEach((date) => {
            const startDateTime: Date = set(date, {
                hours: localStartTime.getHours(),
                minutes: localStartTime.getMinutes(),
            });
            const endDateTime: Date = set(date, { hours: localEndTime.getHours(), minutes: localEndTime.getMinutes() });
            const utcStartDateTime: Date = fromZonedTime(startDateTime, timezone);
            const utcEndDateTime: Date = fromZonedTime(endDateTime, timezone);
            if (!storedDates.some((date) => isSameUtcDay(date, utcStartDateTime))) {
                storedDates.push(utcStartDateTime);
            }
            if (!storedDates.some((date) => isSameUtcDay(date, utcEndDateTime))) {
                storedDates.push(utcEndDateTime);
            }
        });
        const utcStartTime: Date = fromZonedTime(localStartTime, timezone);
        const utcEndTime: Date = fromZonedTime(localEndTime, timezone);
        const connection = await pool.getConnection();
        console.log(storedDates);
        try {
            await connection.beginTransaction();
            await connection.query(eventSql, [
                eventId,
                name,
                formatInTimeZone(utcStartTime, "UTC", timeFormat),
                formatInTimeZone(utcEndTime, "UTC", timeFormat),
            ]);
            await connection.query(eventDatesSql, [
                storedDates.map((val) => [eventId, formatInTimeZone(val, "UTC", dateFormat)]),
            ]);
            await connection.commit();
        } catch (error: any) {
            await connection.rollback();
            switch (error.code) {
                case "ER_DUP_ENTRY":
                    throw new ConflictError("Attempted to create event with existing ID. Please try again.");
                default: {
                    throw new DatabaseError("Database error occured. Please try again.");
                }
            }
        } finally {
            connection.release();
        }
        return eventId;
    }
}
