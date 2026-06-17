import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";

// ─── JWT Configuration ──────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "courier-track-dev-secret-key";
const JWT_EXPIRES_IN = "24h";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Authenticates a user by email/password and returns a JWT.
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  // 1. Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // 3. Generate JWT
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

/**
 * Verifies a JWT and returns the decoded payload.
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}
