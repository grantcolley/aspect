import dotenv from "dotenv";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedUsers } from "./seedUsers";
import { getUsers } from "./data/userData";
import { seedModules } from "./seedModules";
import { getModules } from "./data/moduleData";
const fs = require("fs");

sqlite3.verbose();

async function seed() {
  dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

  let dbFile = `./${process.env.DATABASE}`;

  if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
    console.log(`Existing database deleted ${dbFile}`);
  }

  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  let users = getUsers();
  let modules = getModules();

  await seedUsers(db, users);
  await seedModules(db, modules);

  await db.close();
  console.log(`Database seeding complete: ${dbFile}`);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
