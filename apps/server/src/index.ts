import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer";
import { errorHandler } from "./middleware/errorHandler";
import navigationRouter from "./routes/navigation";
import permissionsRouter from "./routes/permissions";
import rolesRouter from "./routes/roles";
import usersRouter from "./routes/users";
import pagesRouter from "./routes/pages";

const env = process.env.NODE_ENV || "development";

dotenv.config({ path: path.resolve(__dirname, `../../../.env.${env}`) });
dotenv.config({ path: path.resolve(__dirname, `../.env.${env}`) });

const HOST = process.env.HOST_URL || "localhost";
const PORT = process.env.HOST_PORT ? parseInt(process.env.HOST_PORT) : 3000;

if (!process.env.DATABASE) {
  throw new Error("DATABASE environment variable is not set");
}

if (!process.env.AUTH_AUDIENCE) {
  throw new Error("AUTH_AUDIENCE environment variable is not set");
}

if (!process.env.AUTH_ISSUER_BASE_URL) {
  throw new Error("AUTH_ISSUER_BASE_URL environment variable is not set");
}

if (!process.env.AUTH_TOKEN_SIGNING_ALGORITHM) {
  throw new Error(
    "AUTH_TOKEN_SIGNING_ALGORITHM environment variable is not set"
  );
}

if (!process.env.ENDPOINT_NAVIGATION) {
  throw new Error("ENDPOINT_NAVIGATION environment variable is not set");
}

if (!process.env.ENDPOINT_PERMISSIONS) {
  throw new Error("ENDPOINT_PERMISSIONS environment variable is not set");
}

if (!process.env.ENDPOINT_ROLES) {
  throw new Error("ENDPOINT_ROLES environment variable is not set");
}

if (!process.env.ENDPOINT_USERS) {
  throw new Error("ENDPOINT_USERS environment variable is not set");
}

if (!process.env.ENDPOINT_PAGES) {
  throw new Error("ENDPOINT_PAGES environment variable is not set");
}

const authAudience = process.env.AUTH_AUDIENCE;
const authIssuerBaseURL = process.env.AUTH_ISSUER_BASE_URL;
const authTokenSigningAlg = process.env.AUTH_TOKEN_SIGNING_ALGORITHM;
const navigationEndpoint = process.env.ENDPOINT_NAVIGATION;
const permissionsEndpoint = process.env.ENDPOINT_PERMISSIONS;
const rolesEndpoint = process.env.ENDPOINT_ROLES;
const usersEndpoint = process.env.ENDPOINT_USERS;
const pagesEndpoint = process.env.ENDPOINT_PAGES;

const app = express();
app.use(express.json());

if (process.env.CORS_URL) {
  app.use(
    cors({
      origin: `${process.env.CORS_URL}`, // or use '*' for all origins (not recommended for production)
      credentials: true, // if you're using cookies or HTTP auth
    })
  );
}

const start = async () => {
  const jwtCheck = auth({
    audience: authAudience,
    issuerBaseURL: authIssuerBaseURL,
    tokenSigningAlg: authTokenSigningAlg,
  });

  // enforce on all endpoints
  app.use(jwtCheck);

  app.use(navigationEndpoint, navigationRouter);
  app.use(permissionsEndpoint, permissionsRouter);
  app.use(rolesEndpoint, rolesRouter);
  app.use(usersEndpoint, usersRouter);
  app.use(pagesEndpoint, pagesRouter);

  // handle all exceptions
  app.use(errorHandler);

  if (!HOST) {
    app.listen(PORT, () =>
      console.log(`Server running on http://${HOST}:${PORT}`)
    );
  } else {
    app.listen(PORT, HOST, () =>
      console.log(`Server running on http://${HOST}:${PORT}`)
    );
  }
};

start();
