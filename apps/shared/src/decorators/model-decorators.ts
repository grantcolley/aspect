import "reflect-metadata";

export type FieldType = "text" | "checkbox" | "datetime" | "select" | "number";

export interface FormFieldOptions {
  label?: string;
  options?: string[]; // for enums / selects
}

const FORM_FIELDS_KEY = Symbol("formFields");

export function FormField(type: FieldType, options: FormFieldOptions = {}) {
  return function (target: any, propertyKey: string) {
    const fields =
      Reflect.getMetadata(FORM_FIELDS_KEY, target.constructor) || [];
    fields.push({ propertyKey, type, options });
    Reflect.defineMetadata(FORM_FIELDS_KEY, fields, target.constructor);
  };
}

export function getFormMetadata(target: Function) {
  return Reflect.getMetadata(FORM_FIELDS_KEY, target) || [];
}
