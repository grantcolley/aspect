import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Role } from "./role";

export class User implements Permissionable, Editability {
  userId: number;
  name: string;
  email: string;
  permission: string;
  isReadOnly: boolean;
  roles: Role[];

  constructor(
    userId: number,
    name: string,
    email: string,
    permission: string,
    isReadOnly: boolean = false,
    roles: Role[] = []
  ) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.permission = permission;
    this.isReadOnly = isReadOnly;
    this.roles = roles;
  }

  addRole(role: Role) {
    if (!this.roles.find((r) => r.roleId === role.roleId)) {
      this.roles.push(role);
    }
  }

  removeRole(roleId: number) {
    this.roles = this.roles.filter((r) => r.roleId !== roleId);
  }
}
