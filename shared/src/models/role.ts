import { Editability } from "../interfaces/editability";
import { Permission } from "./permission";

export class Role implements Editability {
  roleId: number;
  name: string;
  isReadonlOnly: boolean;
  permissions: Permission[];

  constructor(
    roleId: number,
    name: string,
    isReadonlOnly: boolean,
    permissions: Permission[] = []
  ) {
    this.roleId = roleId;
    this.name = name;
    this.isReadonlOnly = isReadonlOnly;
    this.permissions = permissions;
  }
}
