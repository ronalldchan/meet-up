export interface getEvent {
    endTime: string;
    dates: string[];
    eventId: string;
    name: string;
    startTime: string;
}

interface User {
    userId: string;
    name: string;
}

export interface getEventUsers {
    users: User[];
}

export interface Availability {
    userId: string;
    dates: string[];
}

export interface getEventAvailability {
    data: Availability[];
}
