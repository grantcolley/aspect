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
              url: "users",
              component: "GenericGrid",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 2,
              name: "Roles",
              icon: "roles",
              url: "roles",
              component: "GenericGrid",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 3,
              name: "Permissions",
              icon: "permissions",
              url: "permissions",
              component: "GenericGrid",
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
              url: "modules",
              component: "GenericGrid",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 5,
              name: "Categories",
              icon: "categories",
              url: "categories",
              component: "GenericGrid",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 6,
              name: "Pages",
              icon: "pages",
              url: "pages",
              component: "GenericGrid",
              permission: "admin_ro|admin_rw",
            },
          ],
        },
      ],
    },
  ] as Module[];
}
