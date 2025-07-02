import { Editability } from "../interfaces/editability";

export class Permission implements Editability {
  permissionId: number;
  name: string;
  isReadonlOnly: boolean;

  constructor(permissionId: number, name: string, isReadonlOnly: boolean) {
    this.permissionId = permissionId;
    this.name = name;
    this.isReadonlOnly = isReadonlOnly;
  }
}
