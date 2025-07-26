import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Page } from "./page";

export class Category implements Permissionable, Editability {
  categoryId: number;
  name: string;
  icon: string;
  permission: string;
  isReadonlOnly: boolean;
  pages: Page[];

  constructor(
    categoryId: number,
    name: string,
    icon: string,
    permission: string,
    isReadonlOnly: boolean = false,
    pages: Page[] = []
  ) {
    this.categoryId = categoryId;
    this.name = name;
    this.icon = icon;
    this.permission = permission;
    this.isReadonlOnly = isReadonlOnly;
    this.pages = pages;
  }

  addPage(pages: Page) {
    if (!this.pages.find((p) => p.pageId === pages.pageId)) {
      this.pages.push(pages);
    }
  }

  removePage(pageId: number) {
    this.pages = this.pages.filter((p) => p.pageId !== pageId);
  }
}
