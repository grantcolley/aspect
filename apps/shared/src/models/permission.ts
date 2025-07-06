import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Permission implements Permissionable, Editability {
  permissionId: number;
  name: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;

  constructor(
    permissionId: number,
    name: string,
    permission: string,
    isVisible: boolean = false,
    isReadonlOnly: boolean = false
  ) {
    this.permissionId = permissionId;
    this.name = name;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
  }
}
