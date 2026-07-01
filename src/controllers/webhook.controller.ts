import { Request, Response, NextFunction } from "express";
import {
  verifyWebhookSignature,
  applyPackageStatusUpdate,
} from "../services/webhook.service";

// Expected shape of the inbound payload from courier-logistics-be
interface PackageStatusWebhookPayload {
  event: string;
  trackingId: string;
  status: string;
  regionCode?: string;
  notes?: string;
  timestamp: string;
}

/**
 * POST /api/webhooks/package-status
 *
 * Receives signed status-update events from the logistics BE.
 *
 * The route is mounted with `express.raw({ type: "application/json" })` so
 * `req.body` is always a raw `Buffer` here — NOT a parsed object. This is
 * required for HMAC verification (which must operate on the exact bytes that
 * were signed on the sender side).
 *
 * Response strategy:
 *  - 401 → bad/missing signature (logistics BE should NOT retry)
 *  - 400 → malformed JSON (logistics BE should NOT retry)
 *  - 200 → always returned for valid, verified payloads — even if the package
 *           isn't found or the status is unmapped — so the sender doesn't
 *           retry events that can never succeed.
 */
export async function packageStatusWebhookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // ── 1. Validate raw body ────────────────────────────────────────────────
    const rawBody = req.body as Buffer;

    if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
      res.status(400).json({ error: "Empty or invalid request body" });
      return;
    }

    // ── 2. Verify HMAC signature ────────────────────────────────────────────
    const signature = req.headers["x-webhook-signature"] as string | undefined;

    if (!signature) {
      res.status(401).json({ error: "Missing X-Webhook-Signature header" });
      return;
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }

    // ── 3. Parse JSON — safe after signature is verified ───────────────────
    let payload: PackageStatusWebhookPayload;
    try {
      payload = JSON.parse(rawBody.toString("utf-8"));
    } catch {
      res.status(400).json({ error: "Payload is not valid JSON" });
      return;
    }

    // ── 4. Route by event type ─────────────────────────────────────────────
    if (payload.event !== "package.status_updated") {
      // Unknown event — acknowledge receipt and move on (do not retry)
      res.status(200).json({
        received: true,
        processed: false,
        reason: `Unknown event type: "${payload.event}"`,
      });
      return;
    }

    // ── 5. Apply the status update ─────────────────────────────────────────
    const result = await applyPackageStatusUpdate({
      trackingId: payload.trackingId,
      status: payload.status,
      regionCode: payload.regionCode,
      notes: payload.notes,
    });

    if (!result.updated) {
      // Valid event, but nothing to update — still 200 to suppress retries
      console.warn(`[webhook] Not processed — ${result.reason}`);
      res.status(200).json({ received: true, processed: false, reason: result.reason });
      return;
    }

    console.log(
      `[webhook] ✅ ${payload.trackingId} → ${payload.status}` +
      (payload.regionCode ? ` @ ${payload.regionCode}` : ""),
    );
    res.status(200).json({ received: true, processed: true });
  } catch (error) {
    next(error);
  }
}
