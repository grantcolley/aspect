import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Page } from "./page";

export class Category implements Editability, Permissionable {
  categoryId: number;
  moduleId: number;
  name: string;
  icon: string;
  isReadonlOnly: boolean;
  isVisible: boolean;
  permission: string;
  pages: Page[];

  constructor(
    categoryId: number,
    moduleId: number,
    name: string,
    icon: string,
    isReadonlOnly: boolean,
    isVisible: boolean,
    permission: string,
    pages: Page[] = []
  ) {
    this.categoryId = categoryId;
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
    this.permission = permission;
    this.pages = pages;
  }

  addPage(pages: Page) {
    pages.categoryId = this.categoryId;
    this.pages.push(pages);
  }
}
