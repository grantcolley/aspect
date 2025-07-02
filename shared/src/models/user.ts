import { Editability } from "../interfaces/editability";
import { Role } from "./role";

export class User implements Editability {
  userId: number;
  name: string;
  email: string;
  isReadonlOnly: boolean;
  roles: Role[];

  constructor(
    userId: number,
    name: string,
    email: string,
    isReadonlOnly: boolean,
    roles: Role[] = []
  ) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.isReadonlOnly = isReadonlOnly;
    this.roles = roles;
  }
}
