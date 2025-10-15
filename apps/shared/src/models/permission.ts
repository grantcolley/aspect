import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { FormField } from "../decorators/model-decorators";

export class Permission implements Permissionable, Editability {
  @FormField("number", { label: "Permission ID" })
  permissionId!: number;

  @FormField("text", { label: "Name" })
  name!: string;

  @FormField("text", { label: "Permission" })
  permission!: string;

  isReadOnly!: boolean;
}
