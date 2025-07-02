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
    isVisible: boolean,
    isReadonlOnly: boolean,
    permissions: Permission[] = []
  ) {
    this.roleId = roleId;
    this.name = name;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
    this.permissions = permissions;
  }
}
