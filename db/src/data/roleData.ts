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
      permissions: [
        {
          permissionId: 1,
          name: PERMISSIONS.ADMIN_READ,
        },
        {
          permissionId: 3,
          name: PERMISSIONS.ACCOUNTS_READ,
        },
      ],
    },
    {
      roleId: 2,
      name: ROLES.ADMIN_WRITER,
      permissions: [
        {
          permissionId: 1,
          name: PERMISSIONS.ADMIN_READ,
        },
        {
          permissionId: 2,
          name: PERMISSIONS.ADMIN_WRITE,
        },
        {
          permissionId: 3,
          name: PERMISSIONS.ACCOUNTS_READ,
        },
        {
          permissionId: 4,
          name: PERMISSIONS.ACCOUNTS_WRITE,
        },
      ],
    },
    {
      roleId: 3,
      name: ROLES.ACCOUNTS_READER,
      permissions: [
        {
          permissionId: 3,
          name: PERMISSIONS.ACCOUNTS_READ,
        },
      ],
    },
    {
      roleId: 4,
      name: ROLES.ACCOUNTS_WRITER,
      permissions: [
        {
          permissionId: 3,
          name: PERMISSIONS.ACCOUNTS_READ,
        },
        {
          permissionId: 4,
          name: PERMISSIONS.ACCOUNTS_WRITE,
        },
      ],
    },
  ] as Role[];
}
