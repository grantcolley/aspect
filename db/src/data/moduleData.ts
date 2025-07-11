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
          permission: "auth_ro|auth_rw",
          pages: [
            {
              pageId: 1,
              name: "Users",
              icon: "users",
              url: "#",
              permission: "auth_ro|auth_rw",
            },
            {
              pageId: 2,
              name: "Roles",
              icon: "roles",
              url: "#",
              permission: "auth_ro|auth_rw",
            },
            {
              pageId: 3,
              name: "Permissions",
              icon: "permissions",
              url: "#",
              permission: "auth_ro|auth_rw",
            },
          ],
        },
        {
          categoryId: 2,
          name: "Applications",
          icon: "applications",
          permission: "apps_ro|apps_rw",
          pages: [
            {
              pageId: 4,
              name: "Modules",
              icon: "modules",
              url: "#",
              permission: "apps_ro|apps_rw",
            },
            {
              pageId: 5,
              name: "Categories",
              icon: "categories",
              url: "#",
              permission: "apps_ro|apps_rw",
            },
            {
              pageId: 6,
              name: "Pages",
              icon: "pages",
              url: "#",
              permission: "apps_ro|apps_rw",
            },
          ],
        },
      ],
    },
  ] as Module[];
}
