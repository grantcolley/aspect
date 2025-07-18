import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  HOST_URL: z.string().min(1),
  HOST_PORT: z.string().transform(Number),
  DATABASE: z.string().min(1),
  AUTH_AUDIENCE: z.string().min(1),
  AUTH_ISSUER_BASE_URL: z.string().min(1),
  AUTH_TOKEN_SIGNING_ALGORITHM: z.string().min(1),
  CORS_URL: z.string().min(1),
  ENDPOINT_NAVIGATION: z.string().min(1),
  ENDPOINT_PERMISSIONS: z.string().min(1),
  ENDPOINT_ROLES: z.string().min(1),
  ENDPOINT_USERS: z.string().min(1),
  ENDPOINT_PAGES: z.string().min(1),
  ENDPOINT_CATEGORIES: z.string().min(1),
  ENDPOINT_MODULES: z.string().min(1),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error(
    "Invalid environment variables:",
    env.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const config = env.data;
