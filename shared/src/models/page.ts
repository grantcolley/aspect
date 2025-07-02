import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Page implements Editability, Permissionable {
  pageId: number;
  categoryId: number;
  name: string;
  icon: string;
  url: string;
  isReadonlOnly: boolean;
  isVisible: boolean;
  permission: string;

  constructor(
    pageId: number,
    categoryId: number,
    name: string,
    icon: string,
    url: string,
    isReadonlOnly: boolean,
    isVisible: boolean,
    permission: string
  ) {
    this.pageId = pageId;
    this.categoryId = categoryId;
    this.name = name;
    this.icon = icon;
    this.url = url;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
    this.permission = permission;
  }
}
