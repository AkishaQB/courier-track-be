import { Router } from "express";
import { prisma } from "../config/database";
import type { Request, Response, NextFunction } from "express";

const router = Router();

// GET /api/regions — List all regions (for frontend dropdowns)
router.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const regions = await prisma.region.findMany({
        orderBy: { regionName: "asc" },
      });
      res.status(200).json(regions);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
