import { z } from "zod";

export const addAvailabilitySchema = z.object({
    availability: z.array(z.string().min(1)).nonempty(),
    timezone: z.string().min(1),
});

export const removeAvailabilitySchema = z.object({
    availability: z.array(z.string().min(1)).nonempty(),
    timezone: z.string().min(1),
});

export type AddAvailability = z.infer<typeof addAvailabilitySchema>;
export type RemoveAvailability = z.infer<typeof removeAvailabilitySchema>;
