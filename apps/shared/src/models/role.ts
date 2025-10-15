import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { FormField } from "../decorators/model-decorators";
import { Permission } from "./permission";

export class Role implements Permissionable, Editability {
  @FormField("number", { label: "Role ID" })
  roleId!: number;

  @FormField("text", { label: "Name" })
  name!: string;

  @FormField("text", { label: "Permission" })
  permission!: string;

  isReadOnly: boolean = false;

  permissions: Permission[] = [];

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
