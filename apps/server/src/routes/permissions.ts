import path from "path";
import dotenv from "dotenv";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Permission } from "shared/src/models/permission";
import { permissionSchema } from "shared/src/validation/permissionSchema";
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
    const result: Permission[] = await db.all(`
      SELECT    permissionId, name, permission  
      FROM 	    permissions
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: Permission = await db.all(
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

    res.status(201).json({ id: result.lastID, name, permission });
  })
);

router.put(
  "/:id",
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

    res.json({ id: _req.params.id, name, permission });
  })
);

router.delete(
  "/:id",
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
