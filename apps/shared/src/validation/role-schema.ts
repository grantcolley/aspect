import { z } from "zod";
import { Role } from "../models/role";
import { registerModel } from "../decorators/model-registry";

export const roleSchema = z.object({
  roleId: z.coerce.number().optional(),
  name: z.string().min(1, "Name is required"),
  permission: z.string().min(1, "Permission is required"),
  isReadOnly: z.boolean().optional(),
});

registerModel(Role, roleSchema);

export type RoleInput = z.infer<typeof roleSchema>;
