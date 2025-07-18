import path from "path";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Module } from "shared/src/models/module";
import { Category } from "shared/src/models/category";
import { ModuleCategory } from "shared/src/interfaces/moduleCategory";
import { moduleSchema } from "shared/src/validation/moduleSchema";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: Module[] = await db.all(`
      SELECT    moduleId, name, icon, permission  
      FROM 	    modules
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<Module>(
      `
      SELECT    moduleId, name, icon, permission  
      FROM 	    modules
      WHERE     moduleId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "module not found" });

    const categories: Category[] = await db.all(
      `
      SELECT        c.categoryId, c.name, c.icon, c.permission  
      FROM 	        moduleCategories mc
      INNER JOIN    categories c ON mc.categoryId = c.categoryId
      WHERE         mc.moduleId = ?
    `,
      _req.params.id
    );

    result.categories = categories;

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = moduleSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO modules (name, icon, permission) VALUES (?, ?, ?)",
      [name, icon, permission]
    );

    const moduleCategoryStatement = await db.prepare(
      "INSERT INTO moduleCategories (moduleId, categoryId) VALUES (?, ?)"
    );

    for (const category of _req.body.categories || []) {
      await moduleCategoryStatement.run(result.lastID, category.categoryId);
    }

    const categories: Category[] = await db.all(
      `
      SELECT        c.categoryId, c.name, c.icon, c.permission  
      FROM 	        moduleCategories mc
      INNER JOIN    categories c ON mc.categoryId = c.categoryId
      WHERE         mc.moduleId = ?
    `,
      result.lastID
    );

    res.status(201).json({
      moduleId: result.lastID,
      name: name,
      icon: icon,
      permission: permission,
      categories: categories,
    });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = moduleSchema.safeParse(_req.body);

    let categories: Category[] = _req.body.categories || [];

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, permission } = parsed.data;

    const db = await dbConnection(dbFile);

    const result = await db.run(
      "UPDATE modules SET name = ?, icon = ?, permission = ? WHERE moduleId = ?",
      [name, icon, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Module not found" });
    }

    const moduleCategories: ModuleCategory[] = await db.all(
      `
      SELECT moduleId, categoryId  
      FROM 	 moduleCategories
      WHERE  moduleId = ?
    `,
      _req.params.id
    );

    const moduleCategoryInsertStatement = await db.prepare(
      "INSERT INTO moduleCategories (moduleId, categoryId) VALUES (?, ?)"
    );

    const moduleCategoryDeleteStatement = await db.prepare(
      "DELETE FROM moduleCategories WHERE moduleId = ? AND categoryId = ?"
    );

    for (const category of categories || []) {
      if (
        !moduleCategories.find((mc) => mc.categoryId === category.categoryId)
      ) {
        moduleCategoryInsertStatement.run(_req.params.id, category.categoryId);
      }
    }

    for (const moduleCategory of moduleCategories || []) {
      if (
        !categories.find((mc) => mc.categoryId === moduleCategory.categoryId)
      ) {
        moduleCategoryDeleteStatement.run(
          moduleCategory.moduleId,
          moduleCategory.categoryId
        );
      }
    }

    categories = await db.all(
      `
      SELECT        c.categoryId, c.name, c.icon, c.permission  
      FROM 	        moduleCategories mc
      INNER JOIN    categories c ON mc.categoryId = c.categoryId
      WHERE         mc.moduleId = ?
    `,
      _req.params.id
    );

    res.json({
      moduleId: _req.params.id,
      name: name,
      icon: icon,
      permission: permission,
      categories: categories,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);

    await db.run(
      "DELETE FROM moduleCategories WHERE moduleId = ?",
      _req.params.id
    );

    const result = await db.run(
      "DELETE FROM modules WHERE moduleId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.status(204).send();
  })
);

export default router;
