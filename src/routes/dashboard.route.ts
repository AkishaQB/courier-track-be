import { Router } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate";
import { getPackageSummaryHandler } from "../controllers/dashboard.controller";

const router = Router();

const summaryQuerySchema = z.object({
  regionId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

router.get("/summary", validate({ query: summaryQuerySchema }), getPackageSummaryHandler);

export default router;
