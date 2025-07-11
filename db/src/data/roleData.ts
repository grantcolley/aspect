import { Role } from "../../../apps/shared/src/models/role";

export function getRoles() {
  return [
    {
      roleId: 1,
      name: "admin",
      permission: "admin_ro|admin_rw",
      permissions: [
        {
          permissionId: 1,
          name: "admin_ro",
          permission: "admin_ro|admin_rw",
        },
        {
          permissionId: 2,
          name: "admin_rw",
          permission: "admin_ro|admin_rw",
        },
        {
          permissionId: 3,
          name: "auth_rw",
          permission: "admin_ro|admin_rw",
        },
        {
          permissionId: 4,
          name: "auth_ro",
          permission: "admin_ro|admin_rw",
        },
      ],
    },
    {
      roleId: 2,
      name: "auth",
      permission: "admin_ro|admin_rw",
      permissions: [
        {
          permissionId: 3,
          name: "auth_rw",
          permission: "admin_ro|admin_rw",
        },
        {
          permissionId: 4,
          name: "auth_ro",
          permission: "admin_ro|admin_rw",
        },
      ],
    },
  ] as Role[];
}
