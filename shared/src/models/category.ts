import { Editability } from "../interfaces/editability";
import { Visibility } from "../interfaces/visibility";
import { Page } from "./page";

export class Category implements Editability, Visibility {
  categoryId: number;
  moduleId: number;
  name: string;
  icon: string;
  isReadonlOnly: boolean;
  isVisible: boolean;
  pages: Page[];

  constructor(
    categoryId: number,
    moduleId: number,
    name: string,
    icon: string,
    isReadonlOnly: boolean,
    isVisible: boolean,
    pages: Page[] = []
  ) {
    this.categoryId = categoryId;
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
    this.pages = pages;
  }

  addPage(pages: Page) {
    pages.categoryId = this.categoryId;
    this.pages.push(pages);
  }
}
