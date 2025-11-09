import "express";

declare global {
  namespace Express {
    interface User {
      email?: string;
    }

    interface Request {
      user?: User; // e.g. set by your auth middleware
      userPermissions?: string[]; // you set this in AttachUserPermissions
    }
  }
}
