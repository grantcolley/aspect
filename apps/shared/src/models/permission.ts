import { Editability } from "../interfaces/editability";
import { FormField } from "../decorators/model-decorators";

export class Permission implements Editability {
  @FormField("number", { label: "Permission ID" })
  permissionId!: number;

  @FormField("text", { label: "Name" })
  name!: string;

  isReadOnly!: boolean;
}
