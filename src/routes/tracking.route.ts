import { Router } from "express";
import { trackPackageHandler } from "../controllers/tracking.controller";
import { validate } from "../middlewares/validate";
import { trackPackageSchema } from "../schemas/tracking.schema";

const router = Router();

// POST /api/tracking — Public package tracking (tracking ID + captcha)
router.post("/", validate({ body: trackPackageSchema }), trackPackageHandler);

export default router;
