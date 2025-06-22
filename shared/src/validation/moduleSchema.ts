import { z } from "zod";

export const moduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
});

export type ModuleInput = z.infer<typeof moduleSchema>;
