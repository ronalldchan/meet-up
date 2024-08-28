import { FieldPacket, ResultSetHeader } from "mysql2";
import pool from "../db";

export class AvailabilityService {
    static async addAvailability(userId: number, availability: string[]) {
        const sql = "INSERT IGNORE INTO availability (user_id, available) VALUES ?";
        try {
            const values = availability.map((a) => [userId, a]);
            await pool.query(sql, [values]);
        } catch (error) {
            throw error;
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
