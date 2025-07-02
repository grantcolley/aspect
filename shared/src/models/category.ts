import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Page } from "./page";

export class Category implements Permissionable, Editability {
  categoryId: number;
  moduleId: number;
  name: string;
  icon: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;
  pages: Page[];

  constructor(
    categoryId: number,
    moduleId: number,
    name: string,
    icon: string,
    permission: string,
    isVisible: boolean,
    isReadonlOnly: boolean,
    pages: Page[] = []
  ) {
    this.categoryId = categoryId;
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
    this.pages = pages;
  }

  addPage(pages: Page) {
    pages.categoryId = this.categoryId;
    this.pages.push(pages);
  }
}
