import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Role } from "./role";

export class User implements Permissionable, Editability {
  userId: number;
  name: string;
  email: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;
  roles: Role[];

  constructor(
    userId: number,
    name: string,
    email: string,
    permission: string,
    isVisible: boolean,
    isReadonlOnly: boolean,
    roles: Role[] = []
  ) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
    this.roles = roles;
  }
}
