import { Request, Response, NextFunction } from "express";
import { login } from "../services/auth.service";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT + user info.
 */
export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user's info.
 * Requires the `authenticate` middleware to run first.
 */
export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = (req as any).user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
