import { Module } from "../../../apps/shared/src/models/module";

export function getModules() {
  return [
    {
      moduleId: 1,
      name: "Administration",
      icon: "settings",
      permission: "admin_ro|admin_rw",
      categories: [
        {
          categoryId: 1,
          name: "Authorisation",
          icon: "authorisation",
          permission: "admin_ro|admin_rw",
          pages: [
            {
              pageId: 1,
              name: "Users",
              icon: "users",
              path: "users",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 2,
              name: "Roles",
              icon: "roles",
              path: "roles",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 3,
              name: "Permissions",
              icon: "permissions",
              path: "permissions",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
          ],
        },
        {
          categoryId: 2,
          name: "Applications",
          icon: "applications",
          permission: "admin_ro|admin_rw",
          pages: [
            {
              pageId: 4,
              name: "Modules",
              icon: "modules",
              path: "modules",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 5,
              name: "Categories",
              icon: "categories",
              path: "categories",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 6,
              name: "Pages",
              icon: "pages",
              path: "pages",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
          ],
        },
      ],
    },
  ] as Module[];
}
