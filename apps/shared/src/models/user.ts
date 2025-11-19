import { Editability } from "../interfaces/editability";
import { FormField } from "../decorators/model-decorators";
import { Role } from "./role";

export class User implements Editability {
  @FormField("number", { label: "User ID" })
  userId!: number;

  @FormField("text", { label: "Name" })
  name!: string;

  @FormField("text", { label: "Email" })
  email!: string;

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
