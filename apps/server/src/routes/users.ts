import path from "path";
import dotenv from "dotenv";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { User } from "shared/src/models/user";
import { Role } from "shared/src/models/role";
import { userSchema } from "shared/src/validation/userSchema";
import { UserRole } from "../interfaces/userRole";
import { asyncHandler } from "../middleware/asyncHandler";

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: path.resolve(__dirname, `../../../../.env.${env}`) });
dotenv.config({ path: path.resolve(__dirname, `../../.env.${env}`) });

const dbFile = path.resolve(
  __dirname,
  `../../../../db/${process.env.DATABASE}`
);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: User[] = await db.all(`
      SELECT    userId, name, email, permission  
      FROM 	    users
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<User>(
      `
      SELECT    userId, name, email, permission  
      FROM 	    users
      WHERE     userId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "User not found" });

    const roles: Role[] = await db.all(
      `
      SELECT        r.roleId, r.name, r.permission  
      FROM 	        userRoles ur
      INNER JOIN    roles r ON ur.roleId = r.roleId
      WHERE         ur.userId = ?
    `,
      _req.params.id
    );

    result.roles = roles;

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = userSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, email, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO users (name, email, permission) VALUES (?, ?, ?)",
      [name, email, permission]
    );

    const userRolesStatement = await db.prepare(
      "INSERT INTO userRoles (userId, roleId) VALUES (?, ?)"
    );

    for (const role of _req.body.roles || []) {
      await userRolesStatement.run(result.lastID, role.roleId);
    }

    const roles: Role[] = await db.all(
      `
      SELECT        r.roleId, r.name, r.permission  
      FROM 	        userRoles ur
      INNER JOIN    roles r ON ur.roleId = r.roleId
      WHERE         ur.userId = ?
    `,
      result.lastID
    );

    res.status(201).json({
      roleId: result.lastID,
      name: name,
      email: email,
      permission: permission,
      roles: roles,
    });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = userSchema.safeParse(_req.body);

    let roles: Role[] = _req.body.roles || [];

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, email, permission } = parsed.data;

    const db = await dbConnection(dbFile);

    const result = await db.run(
      "UPDATE users SET name = ?, email = ?, permission = ? WHERE userId = ?",
      [name, email, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userRoles: UserRole[] = await db.all(
      `
      SELECT userId, roleId  
      FROM 	 userRoles
      WHERE  userId = ?
    `,
      _req.params.id
    );

    const userRolesInsertStatement = await db.prepare(
      "INSERT INTO userRoles (userId, roleId) VALUES (?, ?)"
    );

    const userRolesDeleteStatement = await db.prepare(
      "DELETE FROM userRoles WHERE userId = ? AND roleId = ?"
    );

    for (const role of roles || []) {
      if (!userRoles.find((r) => r.roleId === role.roleId)) {
        userRolesInsertStatement.run(_req.params.id, role.roleId);
      }
    }

    for (const userRole of userRoles || []) {
      if (!roles.find((r) => r.roleId === userRole.roleId)) {
        userRolesDeleteStatement.run(userRole.userId, userRole.roleId);
      }
    }
    roles = await db.all(
      `
      SELECT        r.roleId, r.name, r.permission  
      FROM 	        userRoles ur
      INNER JOIN    roles r ON ur.roleId = r.roleId
      WHERE         ur.userId = ?
    `,
      _req.params.id
    );

    res.json({
      roleId: _req.params.id,
      name: name,
      email: email,
      permission: permission,
      roles: roles,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.run(
      "DELETE FROM users WHERE userId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).send();
  })
);

export default router;
