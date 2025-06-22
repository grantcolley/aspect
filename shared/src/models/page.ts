import { Editability } from "../interfaces/editability";
import { Visibility } from "../interfaces/visibility";

export class Page implements Editability, Visibility {
  id: number;
  categoryId: number;
  name: string;
  icon: string;
  url: string;
  isReadonlOnly: boolean;
  isVisible: boolean;

  constructor(
    id: number,
    categoryId: number,
    name: string,
    icon: string,
    url: string,
    isReadonlOnly: boolean,
    isVisible: boolean
  ) {
    this.id = id;
    this.categoryId = categoryId;
    this.name = name;
    this.icon = icon;
    this.url = url;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
  }
}
