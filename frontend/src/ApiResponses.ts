export interface getEvent {
    endTime: string;
    dates: string[];
    eventId: number;
    name: string;
    startTime: string;
}

interface User {
    userId: number;
    name: string;
}

export interface getEventUsers {
    users: User[];
}

export interface Availability {
    userId: number;
    dates: string[];
}

export interface getEventAvailability {
    data: Availability[];
}
