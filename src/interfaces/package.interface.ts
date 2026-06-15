export interface CreatePackageInput {
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  weightKg: number;
  regionId: string;
  paymentMethod: "cash" | "card" | "online";
}

export interface CreatePackageResult {
  trackingId: string;
  billNumber: string;
  amount: number;
  status: string;
}

export enum PackageStatus {
  to_be_picked_up,
  picked_up,
  in_transit,
  out_for_delivery,
  delivered,
  delayed,
}
