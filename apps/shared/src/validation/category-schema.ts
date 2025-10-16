import { z } from "zod";
import { Category } from "../models/category";
import { registerModel } from "../decorators/model-registry";

export const categorySchema = z.object({
  categoryId: z.coerce.number().optional(),
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  permission: z.string().min(1, "Permission is required"),
  isReadOnly: z.boolean().optional(),
});

registerModel(Category, categorySchema);

export type CategoryInput = z.infer<typeof categorySchema>;
