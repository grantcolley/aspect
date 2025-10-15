import { ZodObject, ZodRawShape } from "zod";

const schemaRegistry = new Map<Function, ZodObject<ZodRawShape>>();
const classRegistry = new Map<string, new () => any>();

export function registerModel<T>(
  cls: new () => T,
  schema: ZodObject<ZodRawShape>
) {
  schemaRegistry.set(cls, schema);
  classRegistry.set(cls.name, cls);
}

export function getSchema(cls: Function) {
  return schemaRegistry.get(cls);
}

export function getClass(name: string) {
  return classRegistry.get(name);
}

export function getAllModels() {
  return Array.from(classRegistry.keys());
}
