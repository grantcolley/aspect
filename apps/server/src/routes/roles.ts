import path from "path";
import dotenv from "dotenv";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Role } from "shared/src/models/role";
import { Permission } from "shared/src/models/permission";
import { RolePermission } from "shared/src/interfaces/rolePermission";
import { roleSchema } from "shared/src/validation/roleSchema";
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
    const result: Role[] = await db.all(`
      SELECT    roleId, name, permission  
      FROM 	    roles
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<Role>(
      `
      SELECT    roleId, name, permission  
      FROM 	    roles
      WHERE     roleId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "Role not found" });

    const permissions: Permission[] = await db.all(
      `
      SELECT        p.permissionId, p.name, p.permission  
      FROM 	        rolePermissions rp
      INNER JOIN    permissions p ON rp.permissionId = p.permissionId
      WHERE         rp.roleId = ?
    `,
      _req.params.id
    );

    result.permissions = permissions;

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = roleSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO roles (name, permission) VALUES (?, ?)",
      [name, permission]
    );

    const rolePermissionsStatement = await db.prepare(
      "INSERT INTO rolePermissions (roleId, permissionId) VALUES (?, ?)"
    );

    for (const permission of _req.body.permissions || []) {
      await rolePermissionsStatement.run(
        result.lastID,
        permission.permissionId
      );
    }

    const permissions: Permission[] = await db.all(
      `
      SELECT        p.permissionId, p.name, p.permission  
      FROM 	        rolePermissions rp
      INNER JOIN    permissions p ON rp.permissionId = p.permissionId
      WHERE         rp.roleId = ?
    `,
      result.lastID
    );

    res.status(201).json({
      roleId: result.lastID,
      name,
      permission,
      permissions: permissions,
    });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = roleSchema.safeParse(_req.body);

    let permissions: Permission[] = _req.body.permissions || [];

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, permission } = parsed.data;

    const db = await dbConnection(dbFile);

    const result = await db.run(
      "UPDATE roles SET name = ?, permission = ? WHERE roleId = ?",
      [name, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    const rolePermissions: RolePermission[] = await db.all(
      `
      SELECT roleId, permissionId  
      FROM 	 rolePermissions
      WHERE  roleId = ?
    `,
      _req.params.id
    );

    const rolePermissionsInsertStatement = await db.prepare(
      "INSERT INTO rolePermissions (roleId, permissionId) VALUES (?, ?)"
    );

    const rolePermissionsDeleteStatement = await db.prepare(
      "DELETE FROM rolePermissions WHERE roleId = ? AND permissionId = ?"
    );

    for (const permission of permissions || []) {
      if (
        !rolePermissions.find((p) => p.permissionId === permission.permissionId)
      ) {
        rolePermissionsInsertStatement.run(
          _req.params.id,
          permission.permissionId
        );
      }
    }

    for (const rolePermission of rolePermissions || []) {
      if (
        !permissions.find((p) => p.permissionId === rolePermission.permissionId)
      ) {
        rolePermissionsDeleteStatement.run(
          rolePermission.roleId,
          rolePermission.permissionId
        );
      }
    }

    permissions = await db.all(
      `
      SELECT        p.permissionId, p.name, p.permission  
      FROM 	        rolePermissions rp
      INNER JOIN    permissions p ON rp.permissionId = p.permissionId
      WHERE         rp.roleId = ?
    `,
      _req.params.id
    );

    res.json({
      roleId: _req.params.id,
      name: name,
      permission: permission,
      permissions: permissions,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);

    await db.run(
      "DELETE FROM rolePermissions WHERE roleId = ?",
      _req.params.id
    );

    const result = await db.run(
      "DELETE FROM roles WHERE roleId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.status(204).send();
  })
);

export default router;
