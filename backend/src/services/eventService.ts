import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db";
import { Event, getEventStruct } from "../interfaces/event";

export class EventService {
    static async getEvent(eventId: number): Promise<Event> {
        const sql = "SELECT * FROM events WHERE event_id = ?";
        try {
            const [rows]: [RowDataPacket[], FieldPacket[]] = await pool.query(sql, [eventId]);
            const event: Event = getEventStruct(rows[0]);
            return event;
        } catch (error) {
            throw error;
        }
    }

    static async createEvent(
        eventId: number,
        name: string,
        startDate: string,
        endDate: string,
        startTime: string,
        endTime: string,
        timezone: string
    ): Promise<boolean> {
        const sql =
            "INSERT INTO events (event_id, name, start_date, end_date, start_time, end_time, timezone) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try {
            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query(sql, [
                eventId,
                name,
                startDate,
                endDate,
                startTime,
                endTime,
                timezone,
            ]);
            return result.affectedRows == 1;
        } catch (error) {
            throw error;
        }
    }
}
