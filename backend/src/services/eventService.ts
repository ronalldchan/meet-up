import { FieldPacket, RowDataPacket } from "mysql2";
import pool from "../db";
import { getSqlEventStruct } from "../interfaces/event";
import { dateFormat, generateNRandomId, timeFormat } from "../utils";
import { format, getMinutes, isAfter, set } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ConflictError, DatabaseError, NotFoundError, ValidationError } from "../errors/customErrors";
import { GetEvent, getEventSchema } from "../schemas/EventRouteSchema";

export class EventService {
    static async getEvent(eventId: string): Promise<GetEvent> {
        const eventSql = "SELECT * FROM events WHERE event_id = ?";
        const [eventRows]: [RowDataPacket[], FieldPacket[]] = await pool.query(eventSql, [eventId]);
        if (eventRows.length <= 0) throw new NotFoundError(`No event of ID ${eventId} was found.`);
        const eventDatesSql = "SELECT * FROM event_dates WHERE event_id = ?";
        const [eventDatesRows]: [RowDataPacket[], FieldPacket[]] = await pool.execute(eventDatesSql, [eventId]);
        if (eventDatesRows.length <= 0) throw new NotFoundError(`No event dates found.`);
        let dates: Date[] = eventDatesRows.map((data) => data.event_date);
        return getEventSchema.parse({ ...getSqlEventStruct(eventRows[0]), dates: dates });
    }

    static async createEvent(
        name: string,
        localDates: Date[],
        localStartTime: Date,
        localEndTime: Date
    ): Promise<string> {
        const eventId: string = generateNRandomId(8);
        const eventSql: string = "INSERT INTO events (event_id, name, start_time, end_time) VALUES (?, ?, ?, ?)";
        const eventDatesSql: string = "INSERT INTO event_dates (event_id, event_date) VALUES ?";
        if (
            !isAfter(localEndTime, localStartTime) ||
            getMinutes(localStartTime) % 30 != 0 ||
            getMinutes(localEndTime) % 30 != 0
        )
            throw new ValidationError(
                "End time should be after start time. Time should be in intervals of 30 minutes."
            );
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute(eventSql, [
                eventId,
                name,
                format(localStartTime, timeFormat),
                format(localEndTime, timeFormat),
            ]);
            await connection.query(eventDatesSql, [localDates.map((val) => [eventId, format(val, dateFormat)])]);
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
