import { Database } from "sqlite";
import { User } from "shared/src/models/user";

export async function seedUsers(db: Database, users: User[]) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );
  `);

  for (const user of users) {
    await db.run(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      user.name,
      user.email
    );
    console.log(`Inserted: ${user.name}`);
  }

  console.log(`Insert Users Complete.`);
}
