export interface Availability {
    userId: string;
    available: Date;
}

export function getSqlAvailabilityStruct(data: any): Availability {
    return {
        userId: data.user_id,
        available: data.available,
    };
}
