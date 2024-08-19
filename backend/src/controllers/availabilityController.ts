import { Request, Response } from "express";
import { AvailabilityService } from "../services/availabilityService";
import { UserService } from "../services/userService";
import { User } from "../interfaces/user";

export class AvailabilityController {
    async addAvailability(req: Request, res: Response) {
        const { eventId, userId } = req.params;
        const { availability } = req.body;
        try {
            const userRows: User[] = await UserService.getUsersFromEvent(parseInt(eventId));
            if (userRows.some((user) => user.userId == parseInt(userId))) {
                res.status(400).json({ error: "User is not part of this event" });
                return;
            }
            let result: boolean = await AvailabilityService.addAvailability(parseInt(userId), availability);
            if (!result) {
                res.status(400).json({ error: "Error occured when inserting availability" });
                return;
            }
            res.status(200).json({ message: "Successfully added availability" });
        } catch (error) {
            res.status(500).json({ error: "Failed to insert availability" });
        }
    }
}
