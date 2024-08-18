import { Event } from "../interfaces/event";
import { User } from "../interfaces/user";

export function getEventStruct(data: any): Event {
    return {
        eventId: data.event_id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        timezone: data.timezone,
    };
}

export function getUserStruct(data: any): User {
    return { userId: data.user_id, eventId: data.event_id, name: data.name };
}
