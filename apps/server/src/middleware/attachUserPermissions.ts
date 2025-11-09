import { RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { config } from "../config/config";
import path from "path";

const dbFile = path.resolve(__dirname, config.DATABASE);

// Helper to normalize email extraction from Auth0/ADFS-style tokens
function getEmailFromJwt(payload: Record<string, unknown>): string | undefined {
  const email = payload[
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
  ] as string | undefined;
  return email?.toLowerCase();
}

export const AttachUserPermissions: RequestHandler = async (req, res, next) => {
  try {
    // express-oauth2-jwt-bearer puts the JWT here:
    // req.auth?.payload is Record<string, unknown>
    const email = req.auth?.payload
      ? getEmailFromJwt(req.auth.payload as any)
      : undefined;

    if (!email) {
      res.status(401).send("User not authenticated");
      return; // <-- just return; not returning a Response object
    }

    const db = await dbConnection(dbFile);
    const rows: { pPermission: string }[] = await db.all(
      `
      SELECT p.name pPermission
      FROM users u
      INNER JOIN userRoles ur ON u.userId = ur.userId
      INNER JOIN rolePermissions rp ON ur.roleId = rp.roleId
      INNER JOIN permissions p ON rp.permissionId = p.permissionId
      WHERE u.email = ?
      `,
      [email]
    );

    if (!rows.length) {
      res.status(403).send("User not registered");
      return;
    }

    req.userPermissions = rows.map((r) => r.pPermission);
    next();
  } catch (error) {
    console.error("AttachUserPermissions error:", error);
    res.status(500).send("Internal server error");
  }
};
