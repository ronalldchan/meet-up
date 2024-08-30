import { FieldPacket, RowDataPacket } from "mysql2";
import pool from "../db";
import { getUserStruct, User } from "../interfaces/user";
import { EventService } from "./eventService";
import { generateNRandomId } from "../utils";
import { ConflictError, DatabaseError, GeneralErrorMessages, NotFoundError } from "../errors";

export class UserService {
    static async getUsersFromEvent(eventId: number): Promise<User[]> {
        const sql = "SELECT * FROM users WHERE event_id = ?";
        await EventService.getEvent(eventId);
        const [userRows]: [RowDataPacket[], FieldPacket[]] = await pool.query(sql, [eventId]);
        return userRows.map((user) => getUserStruct(user));
    }

    static async createUser(eventId: number, name: string): Promise<number> {
        const sql = "INSERT INTO users (user_id, event_id, name) VALUES (?, ?, ?)";
        const userId: number = generateNRandomId(8);
        try {
            await pool.query(sql, [userId, eventId, name]);
            return userId;
        } catch (error: any) {
            console.log(error);
            switch (error.code) {
                case "ER_DUP_ENTRY":
                    throw new ConflictError("User already exists");
                case "ER_NO_REFERENCED_ROW_2":
                    throw new NotFoundError(`Event ID of ${eventId} does not exist.`);
                default:
                    throw new DatabaseError(GeneralErrorMessages.UNKNOWN);
            }
        }
    }

    static async getUser(userId: number): Promise<User> {
        const sql = "SELECT * FROM users WHERE user_id =  ?";
        try {
            const [userRows]: [RowDataPacket[], FieldPacket[]] = await pool.query(sql, [userId]);
            return getUserStruct(userRows[0]);
        } catch (error) {
            throw error;
        }
    }
}
