import { FieldPacket, ResultSetHeader } from "mysql2";
import pool from "../db";

export class AvailabilityService {
    static async addAvailability(userId: number, availability: string): Promise<boolean> {
        const sql = "INSERT IGNORE INTO availability (user_id, available) values (?, ?)";
        try {
            await pool.execute(sql, [userId, availability]);
            return true;
        } catch (error) {
            throw new Error("Database query failed");
        }
    }

    static async removeAvailability(userId: number, availability: string): Promise<boolean> {
        const sql = "DELETE FROM availability WHERE user_id = ? and availability = ?";
        try {
            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query(sql, [userId, availability]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error("Database deletion failed");
        }
    }
}
