import { Editability } from "../interfaces/editability";
import { Visibility } from "../interfaces/visibility";

export class Page implements Editability, Visibility {
  pageId: number;
  categoryId: number;
  name: string;
  icon: string;
  url: string;
  isReadonlOnly: boolean;
  isVisible: boolean;

  constructor(
    pageId: number,
    categoryId: number,
    name: string,
    icon: string,
    url: string,
    isReadonlOnly: boolean,
    isVisible: boolean
  ) {
    this.pageId = pageId;
    this.categoryId = categoryId;
    this.name = name;
    this.icon = icon;
    this.url = url;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
  }
}
