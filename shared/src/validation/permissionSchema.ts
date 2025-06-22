import { z } from "zod";

export const permissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type PermissionInput = z.infer<typeof permissionSchema>;
