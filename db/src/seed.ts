import sqlite3 from "sqlite3";
import { open } from "sqlite";

sqlite3.verbose();

async function seed() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );
  `);

  const users = [
    { name: "Alice", email: "alice@email.com" },
    { name: "Grant", email: "grant@email.com" },
  ];

  for (const user of users) {
    await db.run(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      user.name,
      user.email
    );
    console.log(`Inserted: ${user.name}`);
  }

  await db.close();
  console.log("Database seeding complete.");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
