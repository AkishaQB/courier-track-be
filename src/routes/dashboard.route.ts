import { Router } from "express";
import { getPackageSummaryHandler } from "../controllers/dashboard.controller";

const router = Router();

router.get("/summary", getPackageSummaryHandler);

export default router;
