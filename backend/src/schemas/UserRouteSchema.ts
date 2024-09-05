import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().min(3),
});

export type CreateUser = z.infer<typeof createUserSchema>;
