import { Database } from "sqlite";
import { User } from "../../apps/shared/src/models/user";

export async function seedUsers(db: Database, users: User[]) {
  const userStatement = await db.prepare(
    "INSERT INTO users (userId, name, email, permission) VALUES (?, ?, ?, ?)"
  );

  const userRoleStatement = await db.prepare(
    "INSERT INTO userRoles (userId, roleId) VALUES (?, ?)"
  );

  for (const user of users) {
    await userStatement.run(
      user.userId,
      user.name,
      user.email,
      user.permission
    );
    console.log(`Inserted: ${user.name}`);

    for (const role of user.roles) {
      await userRoleStatement.run(user.userId, role.roleId);
      console.log(`Inserted: userId ${user.userId}, roleId ${role.roleId}`);
    }
  }

  userStatement.finalize();
  userRoleStatement.finalize();

  console.log(`Insert Users Complete.`);
}
