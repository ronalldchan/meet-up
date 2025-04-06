export interface Event {
    eventId: string;
    name: string;
    startTime: string;
    endTime: string;
}

export function getSqlEventStruct(data: any): Event {
    return {
        eventId: data.event_id,
        name: data.name,
        startTime: data.start_time.substring(0, 5),
        endTime: data.end_time.substring(0, 5),
    };
}
