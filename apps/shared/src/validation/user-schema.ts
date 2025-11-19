import { z } from "zod";
import { User } from "../models/user";
import { registerModel } from "../decorators/model-registry";

export const userSchema = z.object({
  userId: z.coerce.number().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  isReadOnly: z.boolean().optional(),
});

registerModel(User, userSchema);

export type UserInput = z.infer<typeof userSchema>;
