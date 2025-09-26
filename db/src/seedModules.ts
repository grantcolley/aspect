import { Database } from "sqlite";
import { Module } from "../../apps/shared/src/models/module";

export async function seedModules(db: Database, modules: Module[]) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
      moduleId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      permission TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      categoryId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      permission TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      pageId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      path TEXT NOT NULL,
      className TEXT NOT NULL,
      component TEXT NOT NULL,
      args TEXT,
      permission TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE moduleCategories (
        moduleId INTEGER,
        categoryId INTEGER,
        PRIMARY KEY (moduleId, categoryId),
        FOREIGN KEY (moduleId) REFERENCES modules(moduleId),
        FOREIGN KEY (categoryId) REFERENCES categories(categoryId)
    );
  `);

  await db.exec(`
    CREATE TABLE categoryPages (
        categoryId INTEGER,
        pageId INTEGER,
        PRIMARY KEY (categoryId, pageId),
        FOREIGN KEY (categoryId) REFERENCES categories(categoryId),
        FOREIGN KEY (pageId) REFERENCES pages(pageId)
    );
  `);

  const modulesStatement = await db.prepare(
    "INSERT INTO modules (moduleId, name, icon, permission) VALUES (?, ?, ?, ?)"
  );

  const categoryStatement = await db.prepare(
    "INSERT INTO categories (categoryId, name, icon, permission) VALUES (?, ?, ?, ?)"
  );

  const pageStatement = await db.prepare(
    "INSERT INTO pages (pageId, name, icon, path, className, component, args, permission) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  const moduleCategoriesStatement = await db.prepare(
    "INSERT INTO moduleCategories (moduleId, categoryId) VALUES (?, ?)"
  );

  const categoryPagesStatement = await db.prepare(
    "INSERT INTO categoryPages (categoryId, pageId) VALUES (?, ?)"
  );

  for (const module of modules) {
    await modulesStatement.run(
      module.moduleId,
      module.name,
      module.icon,
      module.permission
    );
    console.log(`Inserted: ${module.name}`);

    for (const category of module.categories) {
      await categoryStatement.run(
        category.categoryId,
        category.name,
        category.icon,
        category.permission
      );
      console.log(`Inserted: ${category.name}`);

      await moduleCategoriesStatement.run(module.moduleId, category.categoryId);
      console.log(
        `Inserted: moduleId ${module.moduleId}, categoryId ${category.categoryId}`
      );

      for (const page of category.pages) {
        await pageStatement.run(
          page.pageId,
          page.name,
          page.icon,
          page.path,
          page.className,
          page.component,
          page.args ?? null,
          page.permission
        );
        console.log(`Inserted: ${page.name}`);

        await categoryPagesStatement.run(category.categoryId, page.pageId);
        console.log(
          `Inserted: categoryId ${category.categoryId}, pageId ${page.pageId}`
        );
      }
    }
  }

  modulesStatement.finalize();
  categoryStatement.finalize();
  pageStatement.finalize();
  moduleCategoriesStatement.finalize();
  categoryPagesStatement.finalize();

  await db.each("SELECT moduleId, name, icon FROM modules", (err, row) => {
    console.log(`Inserted ${row.name}`);
  });

  console.log(`Insert Modules Complete.`);
}
