import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  permission: z.string().min(1, "Permission is required"),
});

export type UserInput = z.infer<typeof userSchema>;
