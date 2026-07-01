import { Router } from "express";
import { packageStatusWebhookHandler } from "../controllers/webhook.controller";

const router = Router();

// POST /api/webhooks/package-status
// Note: express.raw({ type: "application/json" }) is applied in app.ts when
// this router is mounted, so req.body arrives here as a raw Buffer.
router.post("/package-status", packageStatusWebhookHandler);

export default router;
