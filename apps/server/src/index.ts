import express from "express";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";
import { config } from "./config/config";
import { errorHandler } from "./middleware/errorHandler";
import { AttachUserPermissions } from "./middleware/attachUserPermissions";
import navigationRouter from "./routes/navigation";
import userPermissionsRouter from "./routes/userpermissions";
import permissionsRouter from "./routes/permissions";
import rolesRouter from "./routes/roles";
import usersRouter from "./routes/users";
import pagesRouter from "./routes/pages";
import categoriesRouter from "./routes/categories";
import modulesRouter from "./routes/modules";

const app = express();
app.use(express.json());

if (config.CORS_URL) {
  app.use(
    cors({
      origin: `${config.CORS_URL}`, // or use '*' for all origins (not recommended for production)
      credentials: true, // if you're using cookies or HTTP auth
    })
  );
}

const start = async () => {
  const jwtCheck = auth({
    audience: config.AUTH_AUDIENCE,
    issuerBaseURL: config.AUTH_ISSUER_BASE_URL,
    tokenSigningAlg: config.AUTH_TOKEN_SIGNING_ALGORITHM,
  });

  // enforce on all endpoints
  app.use(jwtCheck);
  app.use(AttachUserPermissions);

  app.use(config.ENDPOINT_NAVIGATION, navigationRouter);
  app.use(config.ENDPOINT_USER_PERMISSIONS, userPermissionsRouter);
  app.use(config.ENDPOINT_PERMISSIONS, permissionsRouter);
  app.use(config.ENDPOINT_ROLES, rolesRouter);
  app.use(config.ENDPOINT_USERS, usersRouter);
  app.use(config.ENDPOINT_PAGES, pagesRouter);
  app.use(config.ENDPOINT_CATEGORIES, categoriesRouter);
  app.use(config.ENDPOINT_MODULES, modulesRouter);

  // handle all exceptions
  app.use(errorHandler);

  app.listen(config.HOST_PORT, config.HOST_URL, () =>
    console.log(
      `Server running on http://${config.HOST_URL}:${config.HOST_PORT}`
    )
  );
};

start();
