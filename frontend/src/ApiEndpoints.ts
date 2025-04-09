const BASE_URL: string = "http://localhost:8080/api";
const BASE_EVENTS = `${BASE_URL}/events`;

export const API = {
    events: {
        base: `${BASE_EVENTS}`,
        byId: (eventId: string) => `${BASE_EVENTS}/${eventId}`,
        users: (eventId: string) => `${BASE_EVENTS}/${eventId}/users`,
        userAvailability: (eventId: string, userId: string) => `${BASE_EVENTS}/${eventId}/users/${userId}`,
        availability: (eventId: string) => `${BASE_EVENTS}/${eventId}/users/availability`,
    },
};
