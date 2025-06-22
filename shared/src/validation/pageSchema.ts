import { z } from "zod";

export const pageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  url: z.string().min(1, "URL is required"),
});

export type PageInput = z.infer<typeof pageSchema>;
