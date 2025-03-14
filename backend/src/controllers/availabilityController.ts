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
    async addAvailability(req: Request, res: Response) {
        const { eventId, userId } = req.params;
        try {
            const result = addAvailabilitySchema.safeParse(req.body);
            if (!result.success) {
                throw new BadRequestError(GeneralErrorMessages.MISSING_INVALID_PARAMETERS);
            }
            const body: AddAvailability = result.data;
            const parsedAvailability: Date[] = body.availability.map((avail) => parseDateTime(avail));
            if (parsedAvailability.some((date) => !isValid(date)) || !isValidTimezone(body.timezone)) {
                throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
            }
            await AvailabilityService.addAvailability(
                Number(eventId),
                Number(userId),
                parsedAvailability,
                body.timezone
            );
            return res.status(200).json({ message: "Successfully added availabilities." });
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }

    async removeAvailability(req: Request, res: Response) {
        const { eventId, userId } = req.params;
        try {
            const result = removeAvailabilitySchema.safeParse(req.body);
            if (!result.success) {
                throw new BadRequestError(GeneralErrorMessages.MISSING_INVALID_PARAMETERS);
            }
            const body: RemoveAvailability = result.data;
            const parsedAvailability: Date[] = body.availability.map((avail) => parseDateTime(avail));
            if (parsedAvailability.some((date) => !isValid(date)) || !isValidTimezone(body.timezone)) {
                throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
            }
            await AvailabilityService.removeAvailability(
                Number(eventId),
                Number(userId),
                parsedAvailability,
                body.timezone
            );
            return res.status(200).json({ message: "Successfully removed availabilities." });
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }

    async getAvailabilities(req: Request, res: Response) {
        const { eventId } = req.params;
        try {
            const availabilityRows: Availability[] = await AvailabilityService.getAvailability(Number(eventId));
            const userAvailMap: Map<number, string[]> = new Map<number, string[]>();
            availabilityRows.forEach((avail) => {
                if (userAvailMap.has(avail.userId)) {
                    userAvailMap.get(avail.userId)?.push(avail.available);
                } else {
                    userAvailMap.set(avail.userId, [avail.available]);
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
            const parsedAvailability: Date[] = body.availability.map((avail) => parseDateTime(avail));
            if (parsedAvailability.some((date) => !isValid(date)) || !isValidTimezone(body.timezone)) {
                throw new BadRequestError(GeneralErrorMessages.INVALID_DATETIME);
            }
            await AvailabilityService.updateAvailability(
                Number(eventId),
                Number(userId),
                parsedAvailability,
                body.timezone
            );
            return res.status(200).json({ message: "Successfully updated availabilities." });
        } catch (error: any) {
            handleErrorResponse(error, res);
        }
    }
}
