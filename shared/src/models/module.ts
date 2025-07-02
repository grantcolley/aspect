import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Category } from "./category";

export class Module implements Editability, Permissionable {
  moduleId: number;
  name: string;
  icon: string;
  isReadonlOnly: boolean;
  isVisible: boolean;
  permission: string;
  categories: Category[];

  constructor(
    moduleId: number,
    name: string,
    icon: string,
    isReadonlOnly: boolean,
    isVisible: boolean,
    permission: string,
    categories: Category[] = []
  ) {
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
    this.permission = permission;
    this.categories = categories;
  }

  addCategory(category: Category) {
    category.moduleId = this.moduleId;
    this.categories.push(category);
  }
}
