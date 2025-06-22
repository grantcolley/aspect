import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
