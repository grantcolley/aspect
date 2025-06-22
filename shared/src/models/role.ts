import { Editability } from "../interfaces/editability";
import { Permission } from "./permission";

export class Role implements Editability {
  id: number;
  name: string;
  isReadonlOnly: boolean;
  permissions: Permission[];

  constructor(
    id: number,
    name: string,
    isReadonlOnly: boolean,
    permissions: Permission[] = []
  ) {
    this.id = id;
    this.name = name;
    this.isReadonlOnly = isReadonlOnly;
    this.permissions = permissions;
  }
}
