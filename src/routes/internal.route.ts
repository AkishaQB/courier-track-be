import { Router } from "express";
import { bulkRawUpdatesHandler } from "../controllers/package.controller";
import { validate } from "../middlewares/validate";
import { bulkRawUpdatesSchema } from "../schemas/package.schema";

const router = Router();

// POST /api/internal/raw-updates — Bulk raw package status updates
// This is a service-to-service endpoint called by the Logistics BE Push ETL.
// No auth required — internal network traffic only.
router.post(
  "/raw-updates",
  validate({ body: bulkRawUpdatesSchema }),
  bulkRawUpdatesHandler,
);

export default router;
