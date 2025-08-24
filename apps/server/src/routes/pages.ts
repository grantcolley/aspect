import path from "path";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Page } from "shared/src/models/page";
import { pageSchema } from "shared/src/validation/pageSchema";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: Page[] = await db.all(`
      SELECT    pageId, name, icon, path, component, args, permission  
      FROM 	    pages
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<Page>(
      `
      SELECT    pageId, name, icon, path, component, args, permission  
      FROM 	    pages
      WHERE     pageId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "Page not found" });

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = pageSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, path, component, args, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO pages (name, icon, path, component, args, permission) VALUES (?, ?, ?, ?, ?, ?)",
      [name, icon, path, component, args, permission]
    );

    res.status(201).json({
      pageId: result.lastID,
      name,
      icon,
      path,
      component,
      args,
      permission,
    });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = pageSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, path, component, args, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "UPDATE pages SET name = ?, icon = ?, path = ?, component = ?, args = ?, permission = ? WHERE pageId = ?",
      [name, icon, path, component, args, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json({
      pageId: _req.params.id,
      name,
      icon,
      path,
      component,
      args,
      permission,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.run(
      "DELETE FROM pages WHERE pageId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(204).send();
  })
);

export default router;
