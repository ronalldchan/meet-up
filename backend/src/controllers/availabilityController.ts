import { Request, Response } from "express";
import { AvailabilityService } from "../services/availabilityService";
import { datetimeFormat, parseDateTime, parseUtcDateTime, isValidIdString, isWithinEventRange } from "../utils";
import { isValid } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { BadRequestError } from "../errors/errors";
import { GeneralErrorMessages } from "../errors";

export class AvailabilityController {
    async addAvailability(req: Request, res: Response) {
        const { eventId, userId } = req.params;
        const { availability, timezone }: { availability: string[]; timezone: string } = req.body;
        try {
            if (!isValidIdString(eventId) || !isValidIdString(userId) || !availability || !timezone) {
                throw new BadRequestError(GeneralErrorMessages.MISSING_INVALID_PARAMETERS);
            }

            // const parsedAvailability: Date[] = availability.map((avail) =>
            //     fromZonedTime(parseDateTime(avail), timezone)
            // );
            // if (parsedAvailability.some((date) => !isValid(date) || date.getMinutes() % 15 != 0)) {
            //     res.status(400).json({
            //         // error: ErrorCodes.BAD_REQUEST,
            //         // message: InsertErrorMessages.INVALID_DATETIME,
            //     });
            //     return;
            // }
            // const eventStart = parseUtcDateTime(event.startDate, event.startTime, timezone);
            // const eventEnd = parseUtcDateTime(event.endDate, event.endTime, timezone);
            // if (parsedAvailability.some((date) => !isWithinEventRange(eventStart, eventEnd, date))) {
            //     // res.status(400).json({
            //     //     error: ErrorCodes.BAD_REQUEST,
            //     //     message: "Datetimes are not within event range",
            //     // });
            //     // return;
            // }
            // const parsedUtcAvailability: string[] = parsedAvailability.map((pa) =>
            //     formatInTimeZone(pa, "UTC", datetimeFormat)
            // );
            // await AvailabilityService.addAvailability(parseInt(userId), parsedUtcAvailability);

            // res.status(200).json({ message: "Successfully added availability" });
        } catch (error: any) {
            res.status(500).json({ error: "Failed to insert availability", message: error.message });
        }
    }

    async removeAvailability(req: Request, res: Response) {
        const { eventId, userId } = req.params;
        const { availability }: { availability: string[] } = req.body;
    }
}
