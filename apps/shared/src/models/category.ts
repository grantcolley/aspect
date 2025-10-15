import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { FormField } from "../decorators/model-decorators";
import { Page } from "./page";

export class Category implements Permissionable, Editability {
  @FormField("number", { label: "Category ID" })
  categoryId!: number;

  @FormField("text", { label: "Name" })
  name!: string;

  @FormField("text", { label: "Icon" })
  icon!: string;

  @FormField("text", { label: "Permission" })
  permission!: string;

  @FormField("checkbox", { label: "Is Read-only" })
  isReadOnly!: boolean;

  pages: Page[] = [];

  addPage(pages: Page) {
    if (!this.pages.find((p) => p.pageId === pages.pageId)) {
      this.pages.push(pages);
    }
  }

  removePage(pageId: number) {
    this.pages = this.pages.filter((p) => p.pageId !== pageId);
  }
}
