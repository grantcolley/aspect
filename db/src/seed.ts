import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedUsers } from "./seedUsers";
import { getUsers } from "./data/userData";
import { seedModules } from "./seedModules";
import { getModules } from "./data/moduleData";
import { getRoles } from "./data/roleData";
import { seedAuthorisation } from "./seedAuthorisation";

sqlite3.verbose();

async function seed() {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });

  if (!process.env.DATABASE) {
    throw new Error("DATABASE environment variable is not set");
  }

  let dbFile = process.env.DATABASE;

  if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
    console.log(`Existing database deleted ${dbFile}`);
  }

  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  let modules = getModules();
  let roles = getRoles();
  let users = getUsers(roles);

  await seedModules(db, modules);
  await seedAuthorisation(db, roles);
  await seedUsers(db, users);

  await db.close();
  console.log(`Database seeding complete: ${dbFile}`);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
