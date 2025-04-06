import { z } from "zod";

export const createEventSchema = z.object({
    name: z.string().min(3),
    dates: z.array(z.string().min(8)).min(1),
    startTime: z.string().min(4),
    endTime: z.string().min(4),
    timezone: z.string().min(1),
});

export const getEventSchema = z.object({
    eventId: z.string().min(1),
    name: z.string().min(1),
    startTime: z.string().min(5),
    endTime: z.string().min(5),
    dates: z.array(z.date()).min(1),
});

export type CreateEvent = z.infer<typeof createEventSchema>;
export type GetEvent = z.infer<typeof getEventSchema>;
