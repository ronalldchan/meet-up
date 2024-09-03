import { FieldPacket, RowDataPacket } from "mysql2";
import pool from "../db";
import { Event, getSqlEventStruct } from "../interfaces/event";
import { dateFormat, generateNRandomId, parseUtcDateTime, isValidInput, timeFormat } from "../utils";
import { GeneralErrorMessages } from "../errors";
import { getMinutes, isAfter, isValid } from "date-fns";
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
        localStartDateTime: Date,
        localEndDateTime: Date,
        timezone: string
    ): Promise<number> {
        const eventId: number = generateNRandomId(8);
        const sql: string =
            "INSERT INTO events (event_id, name, start_date, end_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)";
        if (!isValidInput(name)) throw new ValidationError("Name should be at least 3 characters long");
        if (
            !isAfter(localEndDateTime, localStartDateTime) ||
            getMinutes(localStartDateTime) % 15 != 0 ||
            getMinutes(localEndDateTime) % 15 != 0
        )
            throw new ValidationError(GeneralErrorMessages.INVALID_DATETIME);
        const utcStartDateTime: Date = fromZonedTime(localStartDateTime, timezone);
        const utcEndDateTime: Date = fromZonedTime(localEndDateTime, timezone);
        try {
            await pool.query(sql, [
                eventId,
                name,
                formatInTimeZone(utcStartDateTime, "UTC", dateFormat),
                formatInTimeZone(utcEndDateTime, "UTC", dateFormat),
                formatInTimeZone(utcStartDateTime, "UTC", timeFormat),
                formatInTimeZone(utcEndDateTime, "UTC", timeFormat),
            ]);
        } catch (error: any) {
            switch (error.code) {
                case "ER_DUP_ENTRY":
                    throw new ConflictError("Attempted to create event with existing ID. Please try again.");
                default: {
                    throw new DatabaseError("Database error occured. Please try again.");
                }
            }
        }
        return eventId;
    }
}
