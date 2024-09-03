import { z } from "zod";

export const CreateEventSchema = z.object({
    name: z.string().min(3),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    timezone: z.string().min(1),
});

export type CreateEvent = z.infer<typeof CreateEventSchema>;
