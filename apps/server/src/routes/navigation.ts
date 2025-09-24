import path from "path";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { NavigationRow } from "shared/src/interfaces/navigationRow";
import { Module } from "shared/src/models/module";
import { Category } from "shared/src/models/category";
import { Page } from "shared/src/models/page";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const rows: NavigationRow[] = await db.all(`
      SELECT  m.moduleId, m.name mName, m.icon mIcon, m.permission mPermission,
              c.categoryId, c.name cName, c.icon cIcon, c.permission cPermission,
              p.pageId, p.name pName, p.icon pIcon, p.path pPath, p.className pClassName, p.component pComponent, p.args pArgs, p.permission pPermission
      FROM 	modules m
      INNER JOIN moduleCategories mc ON m.moduleId = mc.moduleId
      INNER JOIN categories c ON mc.categoryId = c.categoryId
      INNER JOIN categoryPages cp ON c.categoryId = cp.categoryId
      INNER JOIN pages p ON cp.pageId = p.pageId;
    `);

    const modulesMap = new Map<number, Module>();
    const categoriesMap = new Map<number, Category>();

    for (const row of rows) {
      let module = modulesMap.get(row.moduleId);
      if (!module) {
        module = new Module();
        module.moduleId = row.moduleId;
        module.name = row.mName;
        module.icon = row.mIcon;
        module.permission = row.mPermission;
        modulesMap.set(row.moduleId, module);
      }

      let category = categoriesMap.get(row.categoryId);
      if (!category) {
        category = new Category();
        category.categoryId = row.categoryId;
        category.name = row.cName;
        category.icon = row.cIcon;
        category.permission = row.cPermission;
        categoriesMap.set(row.categoryId, category);
      }

      const moduleCategory = module.categories.some(
        (category) => category.categoryId === row.categoryId
      );
      if (!moduleCategory) {
        module.addCategory(category);
      }

      const page = new Page();
      page.pageId = row.pageId;
      page.name = row.pName;
      page.icon = row.pIcon;
      page.path = row.pPath;
      page.className = row.pClassName;
      page.component = row.pComponent;
      page.args = row.pArgs;
      page.permission = row.pPermission;

      if (!category.pages.some((p) => p.pageId === page.pageId)) {
        category.addPage(page);
      }
    }

    res.json(Array.from(modulesMap.values()));
  })
);

export default router;
