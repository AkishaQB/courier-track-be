export function generateBillNumber(): string {
  return `BILL-${Date.now()}`;
}

export function calculateAmount(weightKg: number): number {
  return weightKg * 50;
}
