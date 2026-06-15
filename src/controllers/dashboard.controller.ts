import { Request, Response, NextFunction } from "express";
import { getDashboardSummary } from "../services/dashboard.service";

// GET /api/dashboard/summary
// Errors are caught by the global errorHandler middleware.
export async function getPackageSummaryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const summary = await getDashboardSummary();
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
}
