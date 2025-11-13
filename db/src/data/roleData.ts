import { Role } from "../../../apps/shared/src/models/role";
import {
  PERMISSIONS,
  ROLES,
} from "../../../apps/shared/src/constants/constants";

export function getRoles() {
  return [
    {
      roleId: 1,
      name: ROLES.ADMIN_READER,
      permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
      permissions: [
        {
          permissionId: 1,
          name: PERMISSIONS.ADMIN_READ,
          permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
        },
        {
          permissionId: 3,
          name: PERMISSIONS.ACCOUNTS_READ,
          permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
        },
      ],
    },
    {
      roleId: 2,
      name: ROLES.ADMIN_WRITER,
      permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
      permissions: [
        {
          permissionId: 1,
          name: PERMISSIONS.ADMIN_READ,
          permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
        },
        {
          permissionId: 2,
          name: PERMISSIONS.ADMIN_WRITE,
          permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
        },
        {
          permissionId: 3,
          name: PERMISSIONS.ACCOUNTS_READ,
          permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
        },
        {
          permissionId: 4,
          name: PERMISSIONS.ACCOUNTS_WRITE,
          permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
        },
      ],
    },
    {
      roleId: 3,
      name: ROLES.ACCOUNTS_READER,
      permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
      permissions: [
        {
          permissionId: 3,
          name: PERMISSIONS.ACCOUNTS_READ,
          permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
        },
      ],
    },
    {
      roleId: 4,
      name: ROLES.ACCOUNTS_WRITER,
      permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
      permissions: [
        {
          permissionId: 3,
          name: PERMISSIONS.ACCOUNTS_READ,
          permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
        },
        {
          permissionId: 4,
          name: PERMISSIONS.ACCOUNTS_WRITE,
          permission: PERMISSIONS.ADMIN_READ + "|" + PERMISSIONS.ADMIN_WRITE,
        },
      ],
    },
  ] as Role[];
}
