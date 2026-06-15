export type PackageSummary = {
  totalPackages: number;
  pendingCount: number;
  pickedUpCount: number;
  inTransitCount: number;
  outForDeliveryCount: number;
  deliveredCount: number;
  delayedCount: number;
};

// Shared shape for package items returned by the dashboard list endpoints
export type DashboardPackageItem = {
  id: string;
  trackingId: string;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  weightKg: number;
  currentStatus: string;
  currentLocation: string | null;
  delayReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  region: {
    id: string;
    regionCode: string;
    regionName: string;
  };
  sale: {
    id: string;
    billNumber: string;
    amount: number;
    paymentMethod: string;
  } | null;
};

export type DashboardListResponse = {
  data: DashboardPackageItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
