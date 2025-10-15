import { z } from "zod";
import { Module } from "../models/module";
import { registerModel } from "../decorators/model-registry";

export const moduleSchema = z.object({
  moduleId: z.coerce.number(),
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  permission: z.string().min(1, "Permission is required"),
  isReadOnly: z.boolean().optional(),
});

registerModel(Module, moduleSchema);

export type ModuleInput = z.infer<typeof moduleSchema>;
