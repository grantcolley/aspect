import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Category } from "./category";

export class Module implements Permissionable, Editability {
  moduleId: number;
  name: string;
  icon: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;
  categories: Category[];

  constructor(
    moduleId: number,
    name: string,
    icon: string,
    permission: string,
    isVisible: boolean,
    isReadonlOnly: boolean,
    categories: Category[] = []
  ) {
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
    this.categories = categories;
  }

  addCategory(category: Category) {
    category.moduleId = this.moduleId;
    this.categories.push(category);
  }
}
