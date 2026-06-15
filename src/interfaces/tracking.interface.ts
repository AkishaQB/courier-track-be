export interface TrackingRequest {
  trackingId: string;
  captchaToken?: string; // Required once captcha is integrated
}

export interface TrackingResult {
  trackingId: string;
  currentStatus: string;
  currentLocation: string | null;
  delayReason: string | null;
  senderName: string;
  receiverName: string;
  receiverAddress: string;
  region: {
    regionCode: string;
    regionName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
