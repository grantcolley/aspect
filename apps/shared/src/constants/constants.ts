export const MODELS = {
  MODULE: "Module",
  CATEGORY: "Category",
  PAGE: "Page",
  USER: "User",
  ROLE: "Role",
  PERMISSION: "Permission",
};

export const PERMISSION_TYPE = {
  READ: ":read",
  WRITE: ":write",
};

export const PERMISSIONS = {
  ADMIN_READ: "admin" + PERMISSION_TYPE.READ,
  ADMIN_WRITE: "admin" + PERMISSION_TYPE.WRITE,
  ACCOUNTS_READ: "accounts" + PERMISSION_TYPE.READ,
  ACCOUNTS_WRITE: "accounts" + PERMISSION_TYPE.WRITE,
};

export const ROLES = {
  ADMIN_READER: "admin:reader",
  ADMIN_WRITER: "admin:writer",
  ACCOUNTS_READER: "accounts:reader",
  ACCOUNTS_WRITER: "accounts:writer",
};

export const COMPONENTS = {
  GENERIC_MODEL_TABLE: "GenericModelTable",
  GENERIC_MODEL_FORM: "GenericModelForm",
};

export const COMPONENT_ARGS = {
  MODEL_NAME: "ModelName",
  MODEL_IDENTITY_FIELD: "IdentityField",
  MODEL_HIDDEN_FIELDS: "HiddenFields",
  MODEL_READONLY_FIELDS: "ReadOnlyFields",
  MODEL_PERMISSIONS: "ModelPermissions",
};
