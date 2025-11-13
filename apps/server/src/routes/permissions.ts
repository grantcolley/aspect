import path from "path";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Permission } from "shared/src/models/permission";
import { permissionSchema } from "shared/src/validation/permission-schema";
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
    const result: Permission[] = await db.all(`
      SELECT    permissionId, name, permission  
      FROM 	    permissions
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.ACCOUNTS_READ),
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<Permission>(
      `
      SELECT    permissionId, name, permission  
      FROM 	    permissions
      WHERE     permissionId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "Permission not found" });

    res.json(result);
  })
);

router.post(
  "/",
  requirePermission(PERMISSIONS.ACCOUNTS_WRITE),
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = permissionSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO permissions (name, permission) VALUES (?, ?)",
      [name, permission]
    );

    res.status(201).json({ permissionId: result.lastID, name, permission });
  })
);

router.put(
  "/:id",
  requirePermission(PERMISSIONS.ACCOUNTS_WRITE),
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = permissionSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "UPDATE permissions SET name = ?, permission = ? WHERE permissionId = ?",
      [name, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }

    res.json({ permissionId: _req.params.id, name, permission });
  })
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ACCOUNTS_WRITE),
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.run(
      "DELETE FROM permissions WHERE permissionId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }

    res.status(204).send();
  })
);

export default router;
