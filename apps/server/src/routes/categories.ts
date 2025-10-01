import path from "path";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Category } from "shared/src/models/category";
import { Page } from "shared/src/models/page";
import { CategoryPage } from "shared/src/interfaces/categoryPage";
import { categorySchema } from "shared/src/validation/category-schema";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: Category[] = await db.all(`
      SELECT    categoryId, name, icon, permission  
      FROM 	    categories
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<Category>(
      `
      SELECT    categoryId, name, icon, permission  
      FROM 	    categories
      WHERE     categoryId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "Category not found" });

    const pages: Page[] = await db.all(
      `
      SELECT        p.pageId, p.name, p.icon, p.path, p.component, p.args, p.permission 
      FROM 	        categoryPages cp
      INNER JOIN    pages p ON cp.pageId = p.pageId
      WHERE         cp.categoryId = ?
    `,
      _req.params.id
    );

    result.pages = pages;

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = categorySchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO categories (name, icon, permission) VALUES (?, ?, ?)",
      [name, icon, permission]
    );

    const categoryPageStatement = await db.prepare(
      "INSERT INTO categoryPages (categoryId, pageId) VALUES (?, ?)"
    );

    for (const page of _req.body.pages || []) {
      await categoryPageStatement.run(result.lastID, page.pageId);
    }

    const pages: Page[] = await db.all(
      `
      SELECT        p.pageId, p.name, p.icon, p.path, p.component, p.args, p.permission 
      FROM 	        categoryPages cp
      INNER JOIN    pages p ON cp.pageId = p.pageId
      WHERE         cp.categoryId = ?
    `,
      result.lastID
    );

    res.status(201).json({
      categoryId: result.lastID,
      name: name,
      icon: icon,
      permission: permission,
      pages: pages,
    });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = categorySchema.safeParse(_req.body);

    let pages: Page[] = _req.body.pages || [];

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, permission } = parsed.data;

    const db = await dbConnection(dbFile);

    const result = await db.run(
      "UPDATE categories SET name = ?, icon = ?, permission = ? WHERE categoryId = ?",
      [name, icon, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const categoryPages: CategoryPage[] = await db.all(
      `
      SELECT categoryId, pageId  
      FROM 	 categoryPages
      WHERE  categoryId = ?
    `,
      _req.params.id
    );

    const categoryPagesInsertStatement = await db.prepare(
      "INSERT INTO categoryPages (categoryId, pageId) VALUES (?, ?)"
    );

    const categoryPagesDeleteStatement = await db.prepare(
      "DELETE FROM categoryPages WHERE categoryId = ? AND pageId = ?"
    );

    for (const page of pages || []) {
      if (!categoryPages.find((p) => p.pageId === page.pageId)) {
        categoryPagesInsertStatement.run(_req.params.id, page.pageId);
      }
    }

    for (const categoryPage of categoryPages || []) {
      if (!pages.find((p) => p.pageId === categoryPage.pageId)) {
        categoryPagesDeleteStatement.run(
          categoryPage.categoryId,
          categoryPage.pageId
        );
      }
    }

    pages = await db.all(
      `
      SELECT        p.pageId, p.name, p.icon, p.path, p.component, p.args, p.permission 
      FROM 	        categoryPages cp
      INNER JOIN    pages p ON cp.pageId = p.pageId
      WHERE         cp.categoryId = ?
    `,
      _req.params.id
    );

    res.json({
      categoryId: _req.params.id,
      name: name,
      icon: icon,
      permission: permission,
      pages: pages,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);

    await db.run(
      "DELETE FROM categoryPages WHERE categoryId = ?",
      _req.params.id
    );

    const result = await db.run(
      "DELETE FROM categories WHERE categoryId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(204).send();
  })
);

export default router;
