import { FieldPacket, RowDataPacket } from "mysql2";
import pool from "../db";
import { getUserStruct, User } from "../interfaces/user";
import { EventService } from "./eventService";
import { generateNRandomId } from "../utils";
import { GeneralErrorMessages } from "../errors";
import { ConflictError, DatabaseError, NotFoundError } from "../errors/customErrors";

export class UserService {
    static async getUsersFromEvent(eventId: string): Promise<User[]> {
        const sql = "SELECT * FROM users WHERE event_id = ?";
        await EventService.getEvent(eventId);
        const [userRows]: [RowDataPacket[], FieldPacket[]] = await pool.query(sql, [eventId]);
        return userRows.map((user) => getUserStruct(user));
    }

    static async createUser(eventId: string, name: string): Promise<string> {
        const sql = "INSERT INTO users (user_id, event_id, name) VALUES (?, ?, ?)";
        const userId: string = generateNRandomId(8);
        try {
            await pool.query(sql, [userId, eventId, name]);
            return userId;
        } catch (error: any) {
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

    static async getUser(userId: string): Promise<User> {
        const sql = "SELECT * FROM users WHERE user_id =  ?";
        const [userRows]: [RowDataPacket[], FieldPacket[]] = await pool.query(sql, [userId]);
        if (userRows.length <= 0) throw new NotFoundError(`User ID of ${userId} does not exist`);
        return getUserStruct(userRows[0]);
    }
}
