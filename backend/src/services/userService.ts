import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db";
import { getUserStruct, User } from "../interfaces/user";

export class UserService {
    static async getUsersFromEvent(eventId: number): Promise<User[]> {
        const sql = "SELECT * FROM users WHERE event_id = ?";
        try {
            const [userRows]: [RowDataPacket[], FieldPacket[]] = await pool.query(sql, [eventId]);
            return userRows.map((user) => getUserStruct(user));
        } catch (error) {
            throw error;
        }
    }

    static async createUser(userId: number, eventId: number, name: string): Promise<boolean> {
        const sql = "INSERT INTO users (user_id, event_id, name) VALUES (?, ?, ?)";
        try {
            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query(sql, [userId, eventId, name]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}
