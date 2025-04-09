import { Request, Response } from "express";
import { AvailabilityService } from "../services/availabilityService";
import { parseDateTime, isValidTimezone } from "../utils";
import { isValid } from "date-fns";
import { BadRequestError } from "../errors/customErrors";
import { GeneralErrorMessages, handleErrorResponse } from "../errors";
import {
    AddAvailability,
    addAvailabilitySchema,
    RemoveAvailability,
    removeAvailabilitySchema,
} from "../schemas/AvailabilityRouteSchema";
import { Availability } from "../interfaces/availability";

export class AvailabilityController {
    async getAvailabilities(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
            const availabilityRows: Availability[] = await AvailabilityService.getAvailability(eventId);
            const userAvailMap: Map<string, string[]> = new Map<string, string[]>();
            availabilityRows.forEach((avail) => {
                if (userAvailMap.has(avail.userId)) {
                    userAvailMap.get(avail.userId)?.push(avail.available.toISOString());
                } else {
                    userAvailMap.set(avail.userId, [avail.available.toISOString()]);
                }
            });
            const availArray = Array.from(userAvailMap.entries()).map(([userId, dates]) => ({
                userId: userId,
                dates: dates,
            }));
            return res.status(200).json({ availabilities: availArray });
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }

    async updateAvailability(req: Request, res: Response) {
        const { eventId, userId } = req.params;
        try {
            const result = addAvailabilitySchema.safeParse(req.body);
            if (!result.success) {
                throw new BadRequestError(GeneralErrorMessages.MISSING_INVALID_PARAMETERS);
            }
            const body: AddAvailability = result.data;
            let parsedAvailability: Date[];
            try {
                parsedAvailability = body.availability.map((avail) => new Date(avail));
            } catch (error) {
                throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
            }
            await AvailabilityService.updateAvailability(eventId, userId, parsedAvailability);
            return res.status(200).json({ message: "Successfully updated availabilities." });
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }
}
