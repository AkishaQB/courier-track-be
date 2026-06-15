import { z } from "zod";

// ─── POST /api/packages — request body ──────────────────
export const createPackageSchema = z.object({
  senderName: z.string().min(1, "Sender name is required"),
  senderAddress: z.string().min(1, "Sender address is required"),
  receiverName: z.string().min(1, "Receiver name is required"),
  receiverAddress: z.string().min(1, "Receiver address is required"),
  weightKg: z.number().positive("Weight must be positive"),
  regionId: z.string().uuid("Invalid region ID"),
  paymentMethod: z.enum(["cash", "card", "online"], {
    message: "Payment method must be cash, card, or online",
  }),
});

// ─── GET /api/packages — query params ───────────────────
// z.coerce.number() converts string query params ("2") → number (2)
export const getPackagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.string().optional(),
});

// ─── GET /api/packages/:trackingId — route param ────────
export const trackingIdParamSchema = z.object({
  trackingId: z.string().uuid("Invalid tracking ID format"),
});
