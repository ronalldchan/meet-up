import { FieldPacket, RowDataPacket } from "mysql2";
import pool from "../db";
import { User } from "../interfaces/user";
import { getUserStruct } from "../utils/sqlToStruct";

export class UserService {
    static async getUsersFromEvent(eventId: number): Promise<User[]> {
        const userSql = "SELECT * from users where event_id = ?";
        try {
            const [userRows]: [RowDataPacket[], FieldPacket[]] = await pool.query(userSql, [eventId]);
            return userRows.map((user) => getUserStruct(user));
        } catch (error) {
            throw new Error("Database query failed");
        }
    }
}
