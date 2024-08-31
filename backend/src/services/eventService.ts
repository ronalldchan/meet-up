import { FieldPacket, RowDataPacket } from "mysql2";
import pool from "../db";
import { Event, getSqlEventStruct } from "../interfaces/event";
import { dateFormat, generateNRandomId, getUtcDateTime, isValidInput, timeFormat } from "../utils";
import { GeneralErrorMessages } from "../errors";
import { getMinutes, isAfter, isValid } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { DatabaseError, NotFoundError, ValidationError } from "../errors/Errors";

export class EventService {
    static async getEvent(eventId: number): Promise<Event> {
        const sql = "SELECT * FROM events WHERE event_id = ?";
        const [rows]: [RowDataPacket[], FieldPacket[]] = await pool.query(sql, [eventId]);
        if (rows.length <= 0) throw new NotFoundError(`No event of ID ${eventId} was found.`);
        return getSqlEventStruct(rows[0]);
    }

    static async createEvent(
        name: string,
        localStartDate: string,
        localEndDate: string,
        localStartTime: string,
        localEndTime: string,
        timezone: string
    ): Promise<number> {
        const eventId: number = generateNRandomId(8);
        const sql: string =
            "INSERT INTO events (event_id, name, start_date, end_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)";
        if (isValidInput(name)) {
            throw new ValidationError("Name should be at least 3 characters long");
        }
        const parsedStartDate: Date = getUtcDateTime(localStartDate, localStartTime, timezone);
        const parsedEndDate: Date = getUtcDateTime(localEndDate, localEndTime, timezone);
        if (
            !isValid(parsedStartDate) ||
            !isValid(parsedEndDate) ||
            !isAfter(parsedEndDate, parsedStartDate) ||
            getMinutes(parsedStartDate) % 15 != 0 ||
            getMinutes(parsedEndDate) % 15 != 0
        ) {
            throw new ValidationError(GeneralErrorMessages.INVALID_DATETIME);
        }

        try {
            await pool.query(sql, [
                eventId,
                name,
                formatInTimeZone(parsedStartDate, "UTC", dateFormat),
                formatInTimeZone(parsedEndDate, "UTC", dateFormat),
                formatInTimeZone(parsedStartDate, "UTC", timeFormat),
                formatInTimeZone(parsedEndDate, "UTC", timeFormat),
            ]);
        } catch (error: any) {
            switch (error.code) {
                case "ER_DUP_ENTRY":
                    throw new DatabaseError("Attempted to create event with existing ID. Please try again.");
                default: {
                    throw new DatabaseError("Database error occured. Please try again.");
                }
            }
        }
        return eventId;
    }
}
