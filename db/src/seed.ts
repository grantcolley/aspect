import dotenv from "dotenv";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedUsers } from "./seedUsers";
import { getUsers } from "./data/userData";

sqlite3.verbose();

async function seed() {
  dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

  console.log(process.env.DATABASE);

  let fileName = "./" + process.env.DATABASE;

  console.log(fileName);

  const db = await open({
    filename: fileName,
    driver: sqlite3.Database,
  });

  let users = getUsers();

  await seedUsers(db, users);

  await db.close();
  console.log("Database seeding complete.");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
