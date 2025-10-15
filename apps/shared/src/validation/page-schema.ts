import { z } from "zod";
import { Page } from "../models/page";
import { registerModel } from "../decorators/model-registry";

export const pageSchema = z.object({
  pageId: z.coerce.number(),
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  path: z.string().min(1, "Path is required"),
  component: z.string().min(1, "Component is required"),
  args: z.string().optional(),
  permission: z.string().min(1, "Permission is required"),
  isReadOnly: z.boolean().optional(),
});

registerModel(Page, pageSchema);

export type PageInput = z.infer<typeof pageSchema>;
