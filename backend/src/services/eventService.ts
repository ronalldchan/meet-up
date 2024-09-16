import { FieldPacket, RowDataPacket } from "mysql2";
import pool from "../db";
import { Event, getSqlEventStruct } from "../interfaces/event";
import { dateFormat, generateNRandomId, isSameUtcDay, timeFormat } from "../utils";
import { GeneralErrorMessages } from "../errors";
import { getMinutes, isAfter, set } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ConflictError, DatabaseError, NotFoundError, ValidationError } from "../errors/errors";

export class EventService {
    static async getEvent(eventId: number): Promise<any> {
        const eventSql = "SELECT * FROM events WHERE event_id = ?";
        const [eventRows]: [RowDataPacket[], FieldPacket[]] = await pool.query(eventSql, [eventId]);
        if (eventRows.length <= 0) throw new NotFoundError(`No event of ID ${eventId} was found.`);
        const eventDatesSql = "SELECT * FROM event_dates WHERE event_id = ?";
        const [eventDatesRows]: [RowDataPacket[], FieldPacket[]] = await pool.query(eventDatesSql, [eventId]);
        if (eventDatesRows.length <= 0) throw new NotFoundError(`No event dates found.`);
        let dates: Date[] = eventDatesRows.map((data) => new Date(data.event_date));
        console.log(eventDatesRows);
        return { ...getSqlEventStruct(eventRows[0]), dates: dates };
    }

    static async createEvent(
        name: string,
        localDates: Date[],
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
        const utcDates: Date[] = localDates.map((date) =>
            fromZonedTime(
                set(date, {
                    hours: localStartTime.getHours(),
                    minutes: localStartTime.getMinutes(),
                }),
                timezone
            )
        );
        const utcStartTime: Date = fromZonedTime(localStartTime, timezone);
        const utcEndTime: Date = fromZonedTime(localEndTime, timezone);
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query(eventSql, [
                eventId,
                name,
                formatInTimeZone(utcStartTime, "UTC", timeFormat),
                formatInTimeZone(utcEndTime, "UTC", timeFormat),
            ]);
            await connection.query(eventDatesSql, [
                utcDates.map((val) => [eventId, formatInTimeZone(val, "UTC", dateFormat)]),
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
