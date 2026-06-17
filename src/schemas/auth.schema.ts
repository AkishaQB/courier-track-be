import { z } from "zod";

// ─── POST /api/auth/login — request body ────────────────
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
