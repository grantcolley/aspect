import { z } from "zod";
import { Permission } from "../models/permission";
import { registerModel } from "../decorators/model-registry";

export const permissionSchema = z.object({
  permissionId: z.coerce.number().optional(),
  name: z.string().min(1, "Name is required"),
  isReadOnly: z.boolean().optional(),
});

registerModel(Permission, permissionSchema);

export type PermissionInput = z.infer<typeof permissionSchema>;
