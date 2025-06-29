import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedUsers } from "./seedUsers";
import { getUsers } from "./data/userData";

sqlite3.verbose();

async function seed() {
  const db = await open({
    filename: "./aspect.sqlite",
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
