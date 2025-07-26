import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Page implements Permissionable, Editability {
  pageId: number;
  name: string;
  icon: string;
  url: string;
  component: string;
  permission: string;
  isReadonlOnly: boolean;

  constructor(
    pageId: number,
    name: string,
    icon: string,
    url: string,
    component: string,
    permission: string,
    isReadonlOnly: boolean = false
  ) {
    this.pageId = pageId;
    this.name = name;
    this.icon = icon;
    this.url = url;
    this.component = component;
    this.permission = permission;
    this.isReadonlOnly = isReadonlOnly;
  }
}
