import { z } from "zod";

export const pageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  path: z.string().min(1, "Path is required"),
  component: z.string().min(1, "Component is required"),
  args: z.string().optional(),
  permission: z.string().min(1, "Permission is required"),
});

export type PageInput = z.infer<typeof pageSchema>;
