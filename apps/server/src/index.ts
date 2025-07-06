import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import createNavigationRoute from "./routes/navigation";
import { initDb } from "./data/db";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.development") });

const dbFile = path.resolve(__dirname, `../../../db/${process.env.DATABASE}`);

const PORT = process.env.HOST_PORT;
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: `${process.env.CORS_URL}`, // or use '*' for all origins (not recommended for production)
    credentials: true, // if you're using cookies or HTTP auth
  })
);

const start = async () => {
  const db = await initDb(dbFile);

  app.use("/api/navigation", createNavigationRoute(db));

  app.listen(PORT, () =>
    console.log(`Server running on ${process.env.HOST_URL}:${PORT}`)
  );
};

start();
