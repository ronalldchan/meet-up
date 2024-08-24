import { formatInTimeZone } from "date-fns-tz";
import { dateFormat, timeFormat } from "../utils";
import { parse } from "date-fns";

export interface Event {
    eventId: number;
    name: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    timezone: string;
}

export function getEventStruct(data: any): Event {
    console.log(data);
    return {
        eventId: data.event_id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        startTime: data.start_time.substring(0, 5),
        endTime: data.end_time.substring(0, 5),
        timezone: data.timezone,
    };
}
