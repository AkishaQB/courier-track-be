
import { prisma } from "../config/database";
import { TrackingResult } from "../interfaces/tracking.interface";

/**
 * Looks up a package by its tracking ID for public-facing display.
 *
 * Returns a curated subset of fields — sensitive data like
 * sender address and sale/billing info is intentionally excluded.
 */
export async function trackPackage(
  trackingId: string,
): Promise<TrackingResult | null> {
  const pkg = await prisma.package.findUnique({
    where: { trackingId },
    include: { region: true },
  });

  if (!pkg) return null;

  return {
    trackingId: pkg.trackingId,
    currentStatus: pkg.currentStatus,
    currentLocation: pkg.currentLocation,
    delayReason: pkg.delayReason,
    senderName: pkg.senderName,
    receiverName: pkg.receiverName,
    receiverAddress: pkg.receiverAddress,
    region: {
      regionCode: pkg.region.regionCode,
      regionName: pkg.region.regionName,
    },
    createdAt: pkg.createdAt,
    updatedAt: pkg.updatedAt,
  };
}
