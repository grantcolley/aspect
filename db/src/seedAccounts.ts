import { Database } from "sqlite";
import { Role } from "../../apps/shared/src/models/role";
import { Permission } from "../../apps/shared/src/models/permission";

export async function seedAuthorisation(db: Database, roles: Role[]) {
  const permissionsMap = new Map<number, Permission>();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      roleId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS permissions (
      permissionId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE userRoles (
        userId INTEGER,
        roleId INTEGER,
        PRIMARY KEY (userId, roleId),
        FOREIGN KEY (userId) REFERENCES users(userId),
        FOREIGN KEY (roleId) REFERENCES roles(roleId)
    );
  `);

  await db.exec(`
    CREATE TABLE rolePermissions (
        roleId INTEGER,
        permissionId INTEGER,
        PRIMARY KEY (roleId, permissionId),
        FOREIGN KEY (roleId) REFERENCES roles(roleId),
        FOREIGN KEY (permissionId) REFERENCES permissions(permissionId)
    );
  `);

  const roleStatement = await db.prepare(
    "INSERT INTO roles (roleId, name) VALUES (?, ?)"
  );

  const permissionStatement = await db.prepare(
    "INSERT INTO permissions (permissionId, name) VALUES (?, ?)"
  );

  const rolePermissionStatement = await db.prepare(
    "INSERT INTO rolePermissions (roleId, permissionId) VALUES (?, ?)"
  );

  for (const role of roles) {
    await roleStatement.run(role.roleId, role.name);
    console.log(`Inserted: ${role.name}`);

    for (const permission of role.permissions) {
      let p = permissionsMap.get(permission.permissionId);
      if (!p) {
        await permissionStatement.run(permission.permissionId, permission.name);
        console.log(`Inserted: ${permission.name}`);

        permissionsMap.set(permission.permissionId, permission);
      }

      await rolePermissionStatement.run(role.roleId, permission.permissionId);
      console.log(
        `Inserted: roleId ${role.roleId}, permissionId ${permission.permissionId}`
      );
    }
  }

  roleStatement.finalize();
  permissionStatement.finalize();
  rolePermissionStatement.finalize();

  console.log(`Insert Authorisation Complete.`);
}
