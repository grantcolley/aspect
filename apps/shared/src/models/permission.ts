import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Permission implements Permissionable, Editability {
  permissionId: number;
  name: string;
  permission: string;
  isReadOnly: boolean;

  constructor(
    permissionId: number,
    name: string,
    permission: string,
    isReadOnly: boolean = false
  ) {
    this.permissionId = permissionId;
    this.name = name;
    this.permission = permission;
    this.isReadOnly = isReadOnly;
  }
}
