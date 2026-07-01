import { prisma } from "../config/database";
import { PackageStatus } from "../generated/prisma/browser";

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

export async function runEtlJob() {
  const unprocessed = await prisma.rawPackageUpdate.findMany({
    where: { processed: false },
    orderBy: { createdAt: "asc" },
  });

  if (unprocessed.length === 0) return;

  console.log(`[ETL Job] Processing ${unprocessed.length} raw package updates...`);

  for (const rawUpdate of unprocessed) {
    const payload = rawUpdate.payload as {
      trackingId: string;
      status: string;
      regionCode?: string;
      notes?: string;
    };

    if (!payload || !payload.trackingId || !payload.status) {
      await prisma.rawPackageUpdate.update({
        where: { id: rawUpdate.id },
        data: { processed: true, processedAt: new Date() },
      });
      continue;
    }

    const mappedStatus = STATUS_MAP[payload.status];
    if (!mappedStatus) {
      console.warn(`[ETL Job] Unmapped status: "${payload.status}" for package ${payload.trackingId}`);
      await prisma.rawPackageUpdate.update({
        where: { id: rawUpdate.id },
        data: { processed: true, processedAt: new Date() },
      });
      continue;
    }

    // Check if the package exists in Track BE's DB
    const existing = await prisma.package.findUnique({
      where: { trackingId: payload.trackingId },
    });

    if (existing) {
      await prisma.$transaction(async (tx) => {
        await tx.package.update({
          where: { trackingId: payload.trackingId },
          data: {
            currentStatus: mappedStatus,
            ...(payload.regionCode && { currentLocation: payload.regionCode }),
            ...(mappedStatus === PackageStatus.delayed
              ? { delayReason: payload.notes ?? null }
              : { delayReason: null }),
          },
        });

        await tx.rawPackageUpdate.update({
          where: { id: rawUpdate.id },
          data: { processed: true, processedAt: new Date() },
        });
      });
      console.log(`[ETL Job] Successfully updated package ${payload.trackingId} to ${mappedStatus}`);
    } else {
      console.warn(`[ETL Job] Package not found: ${payload.trackingId}`);
      await prisma.rawPackageUpdate.update({
        where: { id: rawUpdate.id },
        data: { processed: true, processedAt: new Date() },
      });
    }
  }
}

export function startEtlInterval(intervalMs: number = 60000) {
  // Run ETL immediately on start, then periodically
  void runEtlJob();
  setInterval(() => {
    void runEtlJob();
  }, intervalMs);
  console.log(`[ETL Job] Background interval started (every ${intervalMs / 1000}s)`);
}
