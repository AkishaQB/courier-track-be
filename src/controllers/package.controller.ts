import { Request, Response, NextFunction } from "express";
import {
  createPackage,
  getAllPackages,
  getPackageByTrackingId,
  saveRawUpdates,
} from "../services/package.service";

/**
 * POST /api/packages
 *
 * The controller's job is simple:
 * 1. Extract data from the request body
 * 2. Pass it to the service layer
 * 3. Send back the response
 *
 * It does NOT contain business logic — that lives in the service.
 * Input validation is handled by the validate() middleware in the route file.
 * Errors are caught by the global errorHandler middleware.
 */
export async function createPackageHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await createPackage(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAllPackagesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Query params are already parsed & coerced by the validate middleware
    // (e.g. "2" → 2 via z.coerce.number())
    const packages = await getAllPackages({
      page: req.query.page as unknown as number | undefined,
      limit: req.query.limit as unknown as number | undefined,
      status: req.query.status as string | undefined,
    });
    res.status(200).json(packages);
  } catch (error) {
    next(error);
  }
}

export async function getPackageByTrackingIdHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { trackingId } = req.params;
    const currentPackage = await getPackageByTrackingId(trackingId as string);
    res.status(200).json(currentPackage);
  } catch (error) {
    next(error);
  }
}

export async function bulkRawUpdatesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { updates } = req.body;
    const result = await saveRawUpdates(updates);
    res.status(201).json({ success: true, count: result.count });
  } catch (error) {
    next(error);
  }
}
