import { Editability } from "../interfaces/editability";

export class Permission implements Editability {
  id: number;
  name: string;
  isReadonlOnly: boolean;

  constructor(id: number, name: string, isReadonlOnly: boolean) {
    this.id = id;
    this.name = name;
    this.isReadonlOnly = isReadonlOnly;
  }
}
