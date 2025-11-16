import { z } from "zod";

const envSchema = z.object({
  VITE_REACT_APP_AUTH0_DOMAIN: z.string().min(1),
  VITE_REACT_APP_AUTH0_CLIENT_ID: z.string().min(1),
  VITE_REACT_APP_AUTH0_AUDIENCE: z.string().min(1),
  VITE_REACT_API_URL: z.string().min(1),
  VITE_REACT_API_NAVIGATION_URL: z.string().min(1),
  VITE_REACT_API_USER_PERMISSIONS_URL: z.string().min(1),
});

const env = envSchema.parse(import.meta.env);

export const config = {
  AUTH0_DOMAIN: env.VITE_REACT_APP_AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: env.VITE_REACT_APP_AUTH0_CLIENT_ID,
  AUTH0_AUDIENCE: env.VITE_REACT_APP_AUTH0_AUDIENCE,
  API_URL: env.VITE_REACT_API_URL,
  API_NAVIGATION_URL: env.VITE_REACT_API_NAVIGATION_URL,
  API_USER_PERMISSIONS_URL: env.VITE_REACT_API_USER_PERMISSIONS_URL,
};
