import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permission: z.string().min(1, "Permission is required"),
});

export type RoleInput = z.infer<typeof roleSchema>;
