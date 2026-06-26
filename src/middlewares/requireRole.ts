/**
 * Role-based access control middleware for courier-track-be.
 *
 * Use AFTER `authenticate` to restrict routes to specific roles.
 * Front-office routes are restricted to "staff" and "admin".
 * A "logistics" JWT is rejected with 403 on these routes.
 *
 * Usage:
 *   app.use("/api/packages", authenticate, requireRole("staff", "admin"), packageRoutes);
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    // `authenticate` runs first, so user should always be present here.
    // Guard anyway in case middleware order changes.
    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError(
        `Access denied. Required role: ${allowedRoles.join(" or ")}.`,
        403,
      );
    }

    next();
  };
}
