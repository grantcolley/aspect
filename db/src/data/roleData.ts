import { Role } from "../../../apps/shared/src/models/role";
import {
  PERMISSIONS,
  ROLES,
} from "../../../apps/shared/src/constants/constants";

export function getRoles() {
  return [
    {
      roleId: 1,
      name: ROLES.ADMIN,
      permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
      permissions: [
        {
          permissionId: 1,
          name: PERMISSIONS.ADMIN_RO,
          permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
        },
        {
          permissionId: 2,
          name: PERMISSIONS.ADMIN_RW,
          permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
        },
        {
          permissionId: 3,
          name: PERMISSIONS.ADMIN_RW,
          permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
        },
        {
          permissionId: 4,
          name: PERMISSIONS.ADMIN_RO,
          permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
        },
      ],
    },
    {
      roleId: 2,
      name: ROLES.AUTH,
      permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
      permissions: [
        {
          permissionId: 3,
          name: PERMISSIONS.ADMIN_RW,
          permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
        },
        {
          permissionId: 4,
          name: PERMISSIONS.ADMIN_RO,
          permission: PERMISSIONS.ADMIN_RO + "|" + PERMISSIONS.ADMIN_RW,
        },
      ],
    },
  ] as Role[];
}
