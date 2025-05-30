import { RequestHandler } from "express";
import { StrictRequestHandler } from "../types";

export const requirePermission = (permission: string): StrictRequestHandler => {
  return (req, res, next) => {
    // Check if user has the required permission
    if (!req.user?.token.permissions.includes(permission)) {
      // Send response but DON'T return it
      res.status(403).json({ error: "Insufficient permissions" });
      return; // Explicit return to stop execution
    }

    // Continue to next middleware
    next();
  };
};

export const requireAllPermissions = (
  ...permissions: string[]
): RequestHandler => {
  return (req, res, next) => {
    const hasAll = permissions.every((p) =>
      req.user?.token.permissions.includes(p)
    );

    if (!hasAll) {
      res.status(403).json({
        error: "Missing required permissions",
        required: permissions,
      });
      return;
    }
    next();
  };
};
