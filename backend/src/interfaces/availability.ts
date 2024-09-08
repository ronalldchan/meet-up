export interface Availability {
    userId: number;
    available: string;
}

export function getSqlAvailabilityStruct(data: any): Availability {
    return {
        userId: data.user_id,
        available: data.available,
    };
}
