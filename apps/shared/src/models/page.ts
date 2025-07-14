import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Page implements Permissionable, Editability {
  pageId: number;
  name: string;
  icon: string;
  url: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;

  constructor(
    pageId: number,
    name: string,
    icon: string,
    url: string,
    permission: string,
    isVisible: boolean = false,
    isReadonlOnly: boolean = false
  ) {
    this.pageId = pageId;
    this.name = name;
    this.icon = icon;
    this.url = url;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
  }
}
