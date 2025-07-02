import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Page implements Permissionable, Editability {
  pageId: number;
  categoryId: number;
  name: string;
  icon: string;
  url: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;

  constructor(
    pageId: number,
    categoryId: number,
    name: string,
    icon: string,
    url: string,
    permission: string,
    isVisible: boolean,
    isReadonlOnly: boolean
  ) {
    this.pageId = pageId;
    this.categoryId = categoryId;
    this.name = name;
    this.icon = icon;
    this.url = url;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
  }
}
