import { Router } from "express";
import {
  createPackageHandler,
  getAllPackagesHandler,
  getPackageByTrackingIdHandler,
} from "../controllers/package.controller";
import { validate } from "../middlewares/validate";
import {
  createPackageSchema,
  getPackagesQuerySchema,
  trackingIdParamSchema,
} from "../schemas/package.schema";

const router = Router();

// POST /api/packages — Create a new package + sale
router.post("/create", validate({ body: createPackageSchema }), createPackageHandler);

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

export default router;
