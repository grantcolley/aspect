import { Editability } from "../interfaces/editability";
import { Visibility } from "../interfaces/visibility";
import { Category } from "./category";

export class Module implements Editability, Visibility {
  moduleId: number;
  name: string;
  icon: string;
  isReadonlOnly: boolean;
  isVisible: boolean;
  categories: Category[];

  constructor(
    moduleId: number,
    name: string,
    icon: string,
    isReadonlOnly: boolean,
    isVisible: boolean,
    categories: Category[] = []
  ) {
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
    this.categories = categories;
  }

  addCategory(category: Category) {
    category.moduleId = this.moduleId;
    this.categories.push(category);
  }
}
