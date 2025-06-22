import { Editability } from "../interfaces/editability";
import { Visibility } from "../interfaces/visibility";
import { Page } from "./page";

export class Category implements Editability, Visibility {
  id: number;
  moduleId: number;
  name: string;
  icon: string;
  isReadonlOnly: boolean;
  isVisible: boolean;
  pages: Page[];

  constructor(
    id: number,
    moduleId: number,
    name: string,
    icon: string,
    isReadonlOnly: boolean,
    isVisible: boolean,
    pages: Page[] = []
  ) {
    this.id = id;
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
    this.pages = pages;
  }

  addPage(pages: Page) {
    pages.categoryId = this.id;
    this.pages.push(pages);
  }
}
