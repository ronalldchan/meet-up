export interface Event {
    eventId: number;
    name: string;
    startDate: Date;
    endDate: Date;
    timezone: string;
}

export function getEventStruct(data: any): Event {
    return {
        eventId: data.event_id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        timezone: data.timezone,
    };
}
