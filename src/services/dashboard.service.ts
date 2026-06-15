// Dashboard service — aggregate counts + filtered package lists

import { prisma } from "../config/database";
import { PackageStatus } from "../generated/prisma/enums";
import {
  PackageSummary,
} from "../interfaces/dashboard.interface";


export async function getDashboardSummary(): Promise<PackageSummary> {
  const groups = await prisma.package.groupBy({
    by: ["currentStatus"],
    _count: { _all: true },
  });

  const countByStatus = new Map(
    groups.map((g) => [g.currentStatus, g._count._all]),
  );

  const get = (s: PackageStatus) => countByStatus.get(s) ?? 0;

  return {
    totalPackages: groups.reduce((sum, g) => sum + g._count._all, 0),
    pendingCount: get(PackageStatus.to_be_picked_up),
    pickedUpCount: get(PackageStatus.picked_up),
    inTransitCount: get(PackageStatus.in_transit),
    outForDeliveryCount: get(PackageStatus.out_for_delivery),
    deliveredCount: get(PackageStatus.delivered),
    delayedCount: get(PackageStatus.delayed),
  };
}