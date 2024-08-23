export interface User {
    userId: number;
    eventId: number;
    name: string;
}

export function getUserStruct(data: any): User {
    return { userId: data.user_id, eventId: data.event_id, name: data.name };
}
