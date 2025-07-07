import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import createNavigationRoute from "./routes/navigation";
import { initDb } from "./data/db";

const env = process.env.NODE_ENV || "development";

dotenv.config({ path: path.resolve(__dirname, `../../../.env.${env}`) });
dotenv.config({ path: path.resolve(__dirname, `../.env.${env}`) });

const HOST = process.env.HOST_URL || "localhost";
const PORT = process.env.HOST_PORT ? parseInt(process.env.HOST_PORT) : 3000;

if (!process.env.DATABASE) {
  throw new Error("DATABASE environment variable is not set");
}

if (!process.env.ENDPOINT_NAVIGATION) {
  throw new Error("ENDPOINT_NAVIGATION environment variable is not set");
}

const dbFile = path.resolve(__dirname, `../../../db/${process.env.DATABASE}`);
const navigationEndpoint = process.env.ENDPOINT_NAVIGATION;

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
  const db = await initDb(dbFile);

  app.use(navigationEndpoint, createNavigationRoute(db));

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
