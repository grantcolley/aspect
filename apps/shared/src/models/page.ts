import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Page implements Permissionable, Editability {
  pageId: number;
  name: string;
  icon: string;
  path: string;
  component: string;
  permission: string;
  isReadOnly: boolean;

  constructor(
    pageId: number,
    name: string,
    icon: string,
    path: string,
    component: string,
    permission: string,
    isReadOnly: boolean = false
  ) {
    this.pageId = pageId;
    this.name = name;
    this.icon = icon;
    this.path = path;
    this.component = component;
    this.permission = permission;
    this.isReadOnly = isReadOnly;
  }
}
