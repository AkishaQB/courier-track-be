import { randomUUID } from "crypto";
import { prisma } from "../config/database";
import {
  CreatePackageInput,
  CreatePackageResult,
} from "../interfaces/package.interface";
import { calculateAmount, generateBillNumber } from "../utils/helper";
import { PackageStatus } from "../generated/prisma/browser";

/**
 * Creates a new package and its associated sale record in a single transaction.
 *
 * Why a transaction?
 * - A package without a sale is invalid (we'd lose billing info)
 * - A sale without a package is meaningless
 * - If either insert fails, we want BOTH to roll back
 */
export async function createPackage(
  input: CreatePackageInput,
): Promise<CreatePackageResult> {
  const trackingId = randomUUID();
  const billNumber = generateBillNumber();
  const amount = calculateAmount(input.weightKg);

  // prisma.$transaction runs both operations in a single database transaction.
  // If the Sale insert fails, the Package insert is also rolled back.
  const [newPackage, regionCode] = await prisma.$transaction(async (tx) => {
    const pkg = await tx.package.create({
      data: {
        trackingId,
        senderName: input.senderName,
        senderAddress: input.senderAddress,
        receiverName: input.receiverName,
        receiverAddress: input.receiverAddress,
        weightKg: input.weightKg,
        regionId: input.regionId,
        // currentStatus defaults to 'to_be_picked_up' (set in schema)
      },
    });

    await tx.sale.create({
      data: {
        billNumber,
        amount,
        paymentMethod: input.paymentMethod,
        packageId: pkg.id,
      },
    });

    const region = await tx.region.findUnique({
      where: { id: input.regionId },
      select: { regionCode: true },
    });

    return [pkg, region?.regionCode || "CENTRAL"] as const;
  });

  // Fire webhook asynchronously to Logistics BE
  // We don't await this to keep the API response fast.
  const webhookUrl = process.env.COURIER_LOGISTICS_WEBHOOK_URL || "http://localhost:3002/api/packages/webhook";
  
  void (async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingId: newPackage.trackingId,
          senderName: newPackage.senderName,
          senderAddress: newPackage.senderAddress,
          receiverName: newPackage.receiverName,
          receiverAddress: newPackage.receiverAddress,
          weightKg: newPackage.weightKg,
          regionCode,
        }),
      });
      if (!response.ok) {
        console.error(`[webhook-creation] Logistics BE returned status ${response.status}`);
      } else {
        console.log(`[webhook-creation] Package ${newPackage.trackingId} successfully registered in Logistics BE`);
      }
    } catch (error) {
      console.error("[webhook-creation] Failed to call Logistics BE webhook:", error);
    }
  })();

  return {
    trackingId: newPackage.trackingId,
    billNumber,
    amount,
    status: newPackage.currentStatus,
  };
}

export async function getAllPackages(
  opts: {
    page?: number;
    limit?: number;
    status?: PackageStatus | string;
  } = {},
) {
  const { page = 1, limit = 10, status } = opts;

  const where = status ? { currentStatus: status as PackageStatus } : undefined;

  const skip = Math.max(0, (page - 1) * limit);

  const [data, total] = await Promise.all([
    prisma.package.findMany({
      where,
      include: { sale: true, region: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.package.count({ where }),
  ]);


  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPackageByTrackingId(trackingId: string) {
  return prisma.package.findUnique({
    where: { trackingId },
    include: { sale: true, region: true },
  });
}

export async function saveRawUpdates(updates: any[]) {
  return prisma.rawPackageUpdate.createMany({
    data: updates.map((upd) => ({
      payload: upd,
      processed: false,
    })),
  });
}
