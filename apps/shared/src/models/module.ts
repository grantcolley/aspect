import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { FormField } from "../decorators/model-decorators";
import { Category } from "./category";

export class Module implements Permissionable, Editability {
  @FormField("number", { label: "Module ID" })
  moduleId!: number;

  @FormField("text", { label: "Name" })
  name!: string;

  @FormField("text", { label: "Icon" })
  icon!: string;

  @FormField("text", { label: "Permission" })
  permission!: string;

  isReadOnly: boolean = false;

  categories: Category[] = [];

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
