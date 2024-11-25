const baseUrl: string = "http://localhost:8080/api/";
export const eventsEndpoint: string = baseUrl + "events";
export const eventsEndpointEvent = (id: string): string => eventsEndpoint + `/${id}`;
export const eventsEndpointUsers = (id: string): string => eventsEndpoint + `/${id}/users`;
export const eventsEndpointAvailability = (id: string): string => eventsEndpointUsers(id) + "/availability";
