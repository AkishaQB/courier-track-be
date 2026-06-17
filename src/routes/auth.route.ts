import { Router } from "express";
import { loginHandler, meHandler } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { loginSchema } from "../schemas/auth.schema";
import { authenticate } from "../middlewares/auth";

const router = Router();

// POST /api/auth/login — Public (no auth required)
router.post("/login", validate({ body: loginSchema }), loginHandler);

// GET /api/auth/me — Protected (requires valid JWT)
router.get("/me", authenticate, meHandler);

export default router;
