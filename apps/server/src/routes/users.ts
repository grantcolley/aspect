import path from "path";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { User } from "shared/src/models/user";
import { Role } from "shared/src/models/role";
import { UserRole } from "shared/src/interfaces/userRole";
import { userSchema } from "shared/src/validation/user-schema";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";
import { requirePermission } from "../middleware/requirePermission";
import { PERMISSIONS } from "shared/src/constants/constants";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  requirePermission(PERMISSIONS.ACCOUNTS_READ),
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: User[] = await db.all(`
      SELECT    userId, name, email  
      FROM 	    users
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.ACCOUNTS_READ),
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<User>(
      `
      SELECT    userId, name, email  
      FROM 	    users
      WHERE     userId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "User not found" });

    const roles: Role[] = await db.all(
      `
      SELECT        r.roleId, r.name  
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
  requirePermission(PERMISSIONS.ACCOUNTS_WRITE),
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = userSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, email } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );

    const userRolesStatement = await db.prepare(
      "INSERT INTO userRoles (userId, roleId) VALUES (?, ?)"
    );

    for (const role of _req.body.roles || []) {
      await userRolesStatement.run(result.lastID, role.roleId);
    }

    const roles: Role[] = await db.all(
      `
      SELECT        r.roleId, r.name  
      FROM 	        userRoles ur
      INNER JOIN    roles r ON ur.roleId = r.roleId
      WHERE         ur.userId = ?
    `,
      result.lastID
    );

    res.status(201).json({
      userId: result.lastID,
      name: name,
      email: email,
      roles: roles,
    });
  })
);

router.put(
  "/:id",
  requirePermission(PERMISSIONS.ACCOUNTS_WRITE),
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = userSchema.safeParse(_req.body);

    let roles: Role[] = _req.body.roles || [];

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, email } = parsed.data;

    const db = await dbConnection(dbFile);

    const result = await db.run(
      "UPDATE users SET name = ?, email = ? WHERE userId = ?",
      [name, email, _req.params.id]
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
      SELECT        r.roleId, r.name  
      FROM 	        userRoles ur
      INNER JOIN    roles r ON ur.roleId = r.roleId
      WHERE         ur.userId = ?
    `,
      _req.params.id
    );

    res.json({
      userId: _req.params.id,
      name: name,
      email: email,
      roles: roles,
    });
  })
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ACCOUNTS_WRITE),
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);

    await db.run("DELETE FROM userRoles WHERE userId = ?", _req.params.id);

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
