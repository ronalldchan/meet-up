import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db";
import { Event } from "../interfaces/event";
import { getEventStruct } from "../utils/sqlToStruct";

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
        timezone: string
    ): Promise<boolean> {
        const sql = "INSERT INTO events (event_id, name, start_date, end_date, timezone) VALUES (?, ?, ?, ?, ?)";
        try {
            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query(sql, [
                eventId,
                name,
                startDate,
                endDate,
                timezone,
            ]);
            return result.affectedRows == 1;
        } catch (error) {
            throw error;
        }
    }
}
