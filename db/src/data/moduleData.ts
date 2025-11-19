import { Module } from "../../../apps/shared/src/models/module";
import {
  MODELS,
  PERMISSIONS,
  COMPONENTS,
  COMPONENT_ARGS,
} from "../../../apps/shared/src/constants/constants";

export function getModules() {
  return [
    {
      moduleId: 1,
      name: "Administration",
      icon: "settings",
      permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ACCOUNTS_READ,
      categories: [
        {
          categoryId: 1,
          name: "Accounts",
          icon: "accounts",
          permission: PERMISSIONS.ACCOUNTS_READ,
          pages: [
            {
              pageId: 1,
              name: "Users",
              icon: "users",
              path: "users",
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args:
                COMPONENT_ARGS.MODEL_NAME +
                "=" +
                MODELS.USER +
                "|" +
                COMPONENT_ARGS.MODEL_IDENTITY_FIELD +
                "=userId" +
                "|" +
                COMPONENT_ARGS.MODEL_READONLY_FIELDS +
                "=userId" +
                "|" +
                COMPONENT_ARGS.MODEL_HIDDEN_FIELDS +
                "=isReadOnly" +
                "|" +
                COMPONENT_ARGS.MODEL_PERMISSIONS +
                "=" +
                PERMISSIONS.ACCOUNTS_READ +
                ";" +
                PERMISSIONS.ACCOUNTS_WRITE,
              permission: PERMISSIONS.ACCOUNTS_READ,
            },
            {
              pageId: 2,
              name: "Roles",
              icon: "roles",
              path: "roles",
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args:
                COMPONENT_ARGS.MODEL_NAME +
                "=" +
                MODELS.ROLE +
                "|" +
                COMPONENT_ARGS.MODEL_IDENTITY_FIELD +
                "=roleId" +
                "|" +
                COMPONENT_ARGS.MODEL_READONLY_FIELDS +
                "=roleId" +
                "|" +
                COMPONENT_ARGS.MODEL_HIDDEN_FIELDS +
                "=isReadOnly" +
                "|" +
                COMPONENT_ARGS.MODEL_PERMISSIONS +
                "=" +
                PERMISSIONS.ACCOUNTS_READ +
                ";" +
                PERMISSIONS.ACCOUNTS_WRITE,
              permission: PERMISSIONS.ACCOUNTS_READ,
            },
            {
              pageId: 3,
              name: "Permissions",
              icon: "permissions",
              path: "permissions",
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args:
                COMPONENT_ARGS.MODEL_NAME +
                "=" +
                MODELS.PERMISSION +
                "|" +
                COMPONENT_ARGS.MODEL_IDENTITY_FIELD +
                "=permissionId" +
                "|" +
                COMPONENT_ARGS.MODEL_READONLY_FIELDS +
                "=permissionId" +
                "|" +
                COMPONENT_ARGS.MODEL_HIDDEN_FIELDS +
                "=isReadOnly" +
                "|" +
                COMPONENT_ARGS.MODEL_PERMISSIONS +
                "=" +
                PERMISSIONS.ACCOUNTS_READ +
                ";" +
                PERMISSIONS.ADMIN_WRITE,
              permission: PERMISSIONS.ACCOUNTS_READ,
            },
          ],
        },
        {
          categoryId: 2,
          name: "Applications",
          icon: "applications",
          permission: PERMISSIONS.ADMIN_READ,
          pages: [
            {
              pageId: 4,
              name: "Modules",
              icon: "modules",
              path: "modules",
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args:
                COMPONENT_ARGS.MODEL_NAME +
                "=" +
                MODELS.MODULE +
                "|" +
                COMPONENT_ARGS.MODEL_IDENTITY_FIELD +
                "=moduleId" +
                "|" +
                COMPONENT_ARGS.MODEL_READONLY_FIELDS +
                "=moduleId" +
                "|" +
                COMPONENT_ARGS.MODEL_HIDDEN_FIELDS +
                "=isReadOnly" +
                "|" +
                COMPONENT_ARGS.MODEL_PERMISSIONS +
                "=" +
                PERMISSIONS.ADMIN_READ +
                ";" +
                PERMISSIONS.ADMIN_WRITE,
              permission: PERMISSIONS.ADMIN_READ,
            },
            {
              pageId: 5,
              name: "Categories",
              icon: "categories",
              path: "categories",
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args:
                COMPONENT_ARGS.MODEL_NAME +
                "=" +
                MODELS.CATEGORY +
                "|" +
                COMPONENT_ARGS.MODEL_IDENTITY_FIELD +
                "=categoryId" +
                "|" +
                COMPONENT_ARGS.MODEL_READONLY_FIELDS +
                "=categoryId" +
                "|" +
                COMPONENT_ARGS.MODEL_HIDDEN_FIELDS +
                "=isReadOnly" +
                "|" +
                COMPONENT_ARGS.MODEL_PERMISSIONS +
                "=" +
                PERMISSIONS.ADMIN_READ +
                ";" +
                PERMISSIONS.ADMIN_WRITE,
              permission: PERMISSIONS.ADMIN_READ,
            },
            {
              pageId: 6,
              name: "Pages",
              icon: "pages",
              path: "pages",
              component: COMPONENTS.GENERIC_MODEL_TABLE,
              args:
                COMPONENT_ARGS.MODEL_NAME +
                "=" +
                MODELS.PAGE +
                "|" +
                COMPONENT_ARGS.MODEL_IDENTITY_FIELD +
                "=pageId" +
                "|" +
                COMPONENT_ARGS.MODEL_READONLY_FIELDS +
                "=PageId" +
                "|" +
                COMPONENT_ARGS.MODEL_HIDDEN_FIELDS +
                "=isReadOnly" +
                "|" +
                COMPONENT_ARGS.MODEL_PERMISSIONS +
                "=" +
                PERMISSIONS.ADMIN_READ +
                ";" +
                PERMISSIONS.ADMIN_WRITE,
              permission: PERMISSIONS.ADMIN_READ,
            },
          ],
        },
      ],
    },
  ] as Module[];
}
