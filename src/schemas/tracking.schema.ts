import { z } from "zod";

// ─── POST /api/tracking — request body ──────────────────
export const trackPackageSchema = z.object({
  trackingId: z.string().uuid("Invalid tracking ID format"),
  captchaToken: z.string().optional(),
});
