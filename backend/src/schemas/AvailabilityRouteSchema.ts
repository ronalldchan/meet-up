import { z } from "zod";

export const AddAvailabilitySchema = z.object({
    availability: z.array(z.string().min(1)).nonempty(),
    timezone: z.string().min(1),
});

export type AddAvailability = z.infer<typeof AddAvailabilitySchema>;
