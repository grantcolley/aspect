import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { FormField } from "../decorators/model-decorators";

export class Page implements Permissionable, Editability {
  @FormField("number", { label: "Page ID" })
  pageId!: number;

  @FormField("text", { label: "Name" })
  name!: string;

  @FormField("text", { label: "Icon" })
  icon!: string;

  @FormField("text", { label: "Path" })
  path!: string;

  @FormField("text", { label: "Component" })
  component!: string;

  @FormField("text", { label: "Args" })
  args!: string;

  @FormField("text", { label: "Permission" })
  permission!: string;

  isReadOnly: boolean = false;
}
