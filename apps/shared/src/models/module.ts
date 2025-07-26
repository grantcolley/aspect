import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Category } from "./category";

export class Module implements Permissionable, Editability {
  moduleId: number;
  name: string;
  icon: string;
  permission: string;
  isReadonlOnly: boolean;
  categories: Category[];

  constructor(
    moduleId: number,
    name: string,
    icon: string,
    permission: string,
    isReadonlOnly: boolean = false,
    categories: Category[] = []
  ) {
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.permission = permission;
    this.isReadonlOnly = isReadonlOnly;
    this.categories = categories;
  }

  addCategory(category: Category) {
    if (!this.categories.find((c) => c.categoryId === category.categoryId)) {
      this.categories.push(category);
    }
  }

  removeCategory(categoryId: number) {
    this.categories = this.categories.filter(
      (c) => c.categoryId !== categoryId
    );
  }
}
