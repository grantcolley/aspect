import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { FormField } from "../decorators/model-decorators";
import { Role } from "./role";

export class User implements Permissionable, Editability {
  @FormField("number", { label: "User ID" })
  userId!: number;

  @FormField("text", { label: "Name" })
  name!: string;

  @FormField("text", { label: "Email" })
  email!: string;

  @FormField("text", { label: "Permission" })
  permission!: string;

  isReadOnly: boolean = false;

  roles: Role[] = [];

  addRole(role: Role) {
    if (!this.roles.find((r) => r.roleId === role.roleId)) {
      this.roles.push(role);
    }
  }

  removeRole(roleId: number) {
    this.roles = this.roles.filter((r) => r.roleId !== roleId);
  }
}
