import { Router } from "express";
import {
  createPackageHandler,
  getAllPackagesHandler,
  getPackageByTrackingIdHandler,
  bulkRawUpdatesHandler,
} from "../controllers/package.controller";
import { validate } from "../middlewares/validate";
import {
  createPackageSchema,
  getPackagesQuerySchema,
  trackingIdParamSchema,
  bulkRawUpdatesSchema,
} from "../schemas/package.schema";

const router = Router();

// POST /api/packages/create — Create a new package + sale
router.post(
  "/create",
  validate({ body: createPackageSchema }),
  createPackageHandler,
);

// GET /api/packages — List packages (filterable, paginated)
router.get(
  "/",
  validate({ query: getPackagesQuerySchema }),
  getAllPackagesHandler,
);

// GET /api/packages/:trackingId — Get package by tracking ID
router.get(
  "/:trackingId",
  validate({ params: trackingIdParamSchema }),
  getPackageByTrackingIdHandler,
);

// POST /api/packages/raw-updates — Bulk raw package status updates
router.post(
  "/raw-updates",
  validate({ body: bulkRawUpdatesSchema }),
  bulkRawUpdatesHandler,
);

export default router;
