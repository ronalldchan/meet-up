export interface Event {
    eventId: number;
    name: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}

export function getSqlEventStruct(data: any): Event {
    return {
        eventId: data.event_id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        startTime: data.start_time.substring(0, 5),
        endTime: data.end_time.substring(0, 5),
    };
}
