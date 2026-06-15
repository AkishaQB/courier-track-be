import express from "express";
import packageRoutes from "./routes/package.route";
import dashboardRoutes from "./routes/dashboard.route";
import trackingRoutes from "./routes/tracking.route";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Parse JSON request bodies (needed for POST /api/packages)
app.use(express.json());

// Health-check route
app.get("/", (_, res) => {
  res.json({
    message: "Courier Track API Running",
  });
});

// ─── API Routes ──────────────────────────────────────────
app.use("/api/packages", packageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tracking", trackingRoutes);

// ─── Error Handler (must be AFTER all routes) ────────────
app.use(errorHandler);

export default app;


