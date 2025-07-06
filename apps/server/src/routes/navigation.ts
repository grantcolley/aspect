import { Router, Request, Response, RequestHandler } from "express";
import { Database } from "sqlite";
import { NavigationRow } from "../interfaces/navigationRow";
import { Module } from "shared/src/models/module";
import { Category } from "shared/src/models/category";
import { Page } from "shared/src/models/page";

export default function createNavigationRoute(db: Database) {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    const rows: NavigationRow[] = await db.all(`
      SELECT  m.moduleId, m.name mName, m.icon mIcon, m.permission mPermission,
              c.categoryId, c.name cName, c.icon cIcon, c.permission cPermission,
              p.pageId, p.name pName, p.icon pIcon, p.url pUrl, p.permission pPermission
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
        module = new Module(
          row.moduleId,
          row.mName,
          row.mIcon,
          row.mPermission,
          true
        );
        modulesMap.set(row.moduleId, module);
      }

      let category = categoriesMap.get(row.categoryId);
      if (!category) {
        category = new Category(
          row.categoryId,
          row.moduleId,
          row.cName,
          row.cIcon,
          row.cPermission,
          true
        );
        categoriesMap.set(row.categoryId, category);
      }

      const moduleCategory = module.categories.some(
        (category) => category.categoryId === row.categoryId
      );
      if (!moduleCategory) {
        module.addCategory(category);
      }

      const page = new Page(
        row.pageId,
        row.categoryId,
        row.pName,
        row.pIcon,
        row.pUrl,
        row.pPermission,
        true
      );

      if (!category.pages.some((p) => p.pageId === page.pageId)) {
        category.addPage(page);
      }
    }

    res.json(Array.from(modulesMap.values()));
  });

  return router;
}
