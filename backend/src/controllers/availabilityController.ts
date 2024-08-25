import { Request, Response } from "express";
import { AvailabilityService } from "../services/availabilityService";
import { UserService } from "../services/userService";
import { User } from "../interfaces/user";
import { getDateTime } from "../utils";
import { isValid } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export class AvailabilityController {
    async addAvailability(req: Request, res: Response) {
        const { eventId, userId } = req.params;
        const { availability, timezone }: { availability: string[]; timezone: string } = req.body;
        try {
            const user: User = await UserService.getUser(parseInt(userId));
            if (user.eventId != parseInt(eventId)) {
                res.status(400).json({ error: "User is not part of this event" });
                return;
            }
            const parsedAvailability: Date[] = availability.map((avail) => fromZonedTime(getDateTime(avail), timezone));
            if (parsedAvailability.some((date) => !isValid(date))) {
                res.status(400).json({ error: "Bad Request", message: "Datetime or timezone value is invalid" });
                return;
            }
            availability.forEach(async (avail) => {
                let result: boolean = await AvailabilityService.addAvailability(parseInt(userId), avail);
                if (!result) {
                    res.status(400).json({ error: "Error occured when inserting availability" });
                }
            });
            res.status(200).json({ message: "Successfully added availability" });
        } catch (error) {
            res.status(500).json({ error: "Failed to insert availability" });
        }
    }

    async removeAvailability(req: Request, res: Response) {
        const { eventId, userId } = req.params;
        const { availability }: { availability: string[] } = req.body;
    }
}
