import { timingSafeEqual, createHmac } from "crypto";
import { prisma } from "../config/database";
import { PackageStatus } from "../generated/prisma/browser";
import "dotenv/config";

// ─── Status Mapping ───────────────────────────────────────────────────────────
//
// The logistics DB has 9 statuses; the Track BE only knows 6.
// We map the logistics-specific intermediate statuses to the closest equivalent.
//
// Logistics Status           → Track BE Status
// ─────────────────────────────────────────────
// to_be_picked_up            → to_be_picked_up
// picked_up                  → picked_up
// added_to_bag               → in_transit       (in the logistics pipeline)
// in_transit                 → in_transit
// arrived                    → in_transit       (arrived at hub, still moving)
// scheduled_for_delivery     → out_for_delivery
// out_for_delivery           → out_for_delivery
// delivered                  → delivered
// delayed                    → delayed

const STATUS_MAP: Record<string, PackageStatus> = {
  to_be_picked_up:        PackageStatus.to_be_picked_up,
  picked_up:              PackageStatus.picked_up,
  added_to_bag:           PackageStatus.in_transit,
  in_transit:             PackageStatus.in_transit,
  arrived:                PackageStatus.in_transit,
  scheduled_for_delivery: PackageStatus.out_for_delivery,
  out_for_delivery:       PackageStatus.out_for_delivery,
  delivered:              PackageStatus.delivered,
  delayed:                PackageStatus.delayed,
};

// ─── HMAC verification ────────────────────────────────────────────────────────

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "";

/**
 * Recomputes the HMAC-SHA256 signature over the raw request body and compares
 * it with the one sent in the `X-Webhook-Signature` header using timing-safe
 * equality to prevent timing attacks.
 *
 * Returns `false` if the secret is unset, the signature header is missing,
 * or if the digests don't match.
 */
export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.error("[webhook] WEBHOOK_SECRET is not configured — rejecting all webhooks");
    return false;
  }

  const expected = `sha256=${createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex")}`;

  try {
    // timingSafeEqual requires same-length buffers; mismatched lengths = mismatch
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ─── Status update ────────────────────────────────────────────────────────────

export interface WebhookApplyResult {
  updated: boolean;
  reason?: string;
}

/**
 * Applies a status update received from the logistics BE to the Track BE's own
 * package record.
 *
 * Uses `trackingId` as the stable cross-system key — it is set at creation time
 * and never changes in either database.
 *
 * Returns `{ updated: false }` (not an error) when the package doesn't exist in
 * Track BE or the incoming status is unmapped; the caller should still respond
 * 200 so the logistics BE doesn't retry endlessly.
 */
export async function applyPackageStatusUpdate(payload: {
  trackingId: string;
  status: string;
  regionCode?: string;
  notes?: string;
}): Promise<WebhookApplyResult> {
  const { trackingId, status, regionCode, notes } = payload;

  // Map the logistics-side status to a Track BE status
  const mappedStatus = STATUS_MAP[status];
  if (!mappedStatus) {
    return { updated: false, reason: `Unmapped logistics status: "${status}"` };
  }

  // Check the package exists in Track BE's DB before trying to update
  const existing = await prisma.package.findUnique({ where: { trackingId } });
  if (!existing) {
    return { updated: false, reason: `Package not found in Track BE: ${trackingId}` };
  }

  await prisma.package.update({
    where: { trackingId },
    data: {
      currentStatus: mappedStatus,
      // Use regionCode as a human-readable current location string
      ...(regionCode && { currentLocation: regionCode }),
      // Only set delayReason when status is 'delayed'; clear it otherwise
      ...(mappedStatus === PackageStatus.delayed
        ? { delayReason: notes ?? null }
        : { delayReason: null }),
    },
  });

  return { updated: true };
}
