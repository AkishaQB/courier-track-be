/**
 * JWT authentication middleware.
 *
 * Reads the `Authorization: Bearer <token>` header, verifies the
 * JWT, and attaches `req.user` with { userId, email, role }.
 *
 * On failure → 401 Unauthorized via AppError.
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth.service";
import { AppError } from "../utils/AppError";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  // Attach user info to the request for downstream handlers
  (req as any).user = payload;
  next();
}
