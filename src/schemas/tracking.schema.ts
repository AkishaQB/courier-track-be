import { z } from "zod";

// ─── POST /api/tracking — request body ──────────────────
export const trackPackageSchema = z.object({
  trackingId: z.string().uuid("Invalid tracking ID format"),
  captchaToken: z.string().min(1, "Captcha token is required").optional(),
});
