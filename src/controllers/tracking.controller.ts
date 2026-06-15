import { Request, Response, NextFunction } from "express";
import { trackPackage } from "../services/tracking.service";
import { AppError } from "../utils/AppError";

// POST /api/tracking
// Input validation (trackingId, captchaToken) is handled by
// the validate() middleware in the route file.
// Errors are caught by the global errorHandler middleware.
export async function trackPackageHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { trackingId } = req.body;

    // ── Captcha verification (placeholder) ───────────────
    // TODO: Integrate hCaptcha verification once the captcha
    //       middleware is set up. For now, we skip validation.

    const result = await trackPackage(trackingId.trim());

    if (!result) {
      throw new AppError("Package not found", 404);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
