import type { Request, Response, NextFunction, RequestHandler } from "express";

export type Permission = string;

export function hasPermission(req: Request, permission: Permission): boolean {
  return !!req.userPermissions?.includes(permission);
}

export function hasAnyPermission(
  req: Request,
  ...permissions: Permission[]
): boolean {
  if (!req.userPermissions?.length) return false;

  return permissions.some((perm) => req.userPermissions!.includes(perm));
}

/*
 * Route guard: ensure the user has the required permission(s) *before* hitting the handler.
 * Place this AFTER `AttachUserPermissions` in the middleware chain.
 */
export function requirePermission(
  required: Permission | Permission[]
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userPermissions) {
      res.status(401).send("User not authenticated");
      return;
    }

    const requiredList = Array.isArray(required) ? required : [required];
    const userPerms = new Set(req.userPermissions);

    const ok = requiredList.some((p) => userPerms.has(p));

    if (!ok) {
      res.status(403).send("Forbidden: missing required permission");
      return;
    }

    next();
  };
}
