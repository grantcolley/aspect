import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Permission } from "./permission";

export class Role implements Permissionable, Editability {
  roleId: number;
  name: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;
  permissions: Permission[];

  constructor(
    roleId: number,
    name: string,
    permission: string,
    isVisible: boolean = false,
    isReadonlOnly: boolean = false,
    permissions: Permission[] = []
  ) {
    this.roleId = roleId;
    this.name = name;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
    this.permissions = permissions;
  }

  addPermission(permission: Permission) {
    if (
      !this.permissions.find((p) => p.permissionId === permission.permissionId)
    ) {
      this.permissions.push(permission);
    }
  }

  removePermission(permissionId: number) {
    this.permissions = this.permissions.filter(
      (p) => p.permissionId !== permissionId
    );
  }
}
