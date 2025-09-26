import { Module } from "../../../apps/shared/src/models/module";
import {
  COMPONENTS,
  MODELS,
  PERMISSIONS,
} from "../../../apps/shared/src/constants/constants";

export function getModules() {
  return [
    {
      moduleId: 1,
      name: "Administration",
      icon: "settings",
      permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
      categories: [
        {
          categoryId: 1,
          name: "Authorisation",
          icon: "authorisation",
          permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
          pages: [
            {
              pageId: 1,
              name: "Users",
              icon: "users",
              path: "users",
              className: MODELS.USER,
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args: "userId",
              permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
            },
            {
              pageId: 2,
              name: "Roles",
              icon: "roles",
              path: "roles",
              className: MODELS.ROLE,
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args: "roleId",
              permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
            },
            {
              pageId: 3,
              name: "Permissions",
              icon: "permissions",
              path: "permissions",
              className: MODELS.PERMISSION,
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args: "permissionId",
              permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
            },
          ],
        },
        {
          categoryId: 2,
          name: "Applications",
          icon: "applications",
          permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
          pages: [
            {
              pageId: 4,
              name: "Modules",
              icon: "modules",
              path: "modules",
              className: MODELS.MODULE,
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args: "moduleId",
              permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
            },
            {
              pageId: 5,
              name: "Categories",
              icon: "categories",
              path: "categories",
              className: MODELS.CATEGORY,
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args: "categoryId",
              permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
            },
            {
              pageId: 6,
              name: "Pages",
              icon: "pages",
              path: "pages",
              className: MODELS.PAGE,
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args: "pageId",
              permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
            },
          ],
        },
      ],
    },
  ] as Module[];
}
