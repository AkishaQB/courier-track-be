import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import packageRoutes from "./routes/package.route";
import dashboardRoutes from "./routes/dashboard.route";
import trackingRoutes from "./routes/tracking.route";
import regionRoutes from "./routes/region.route";
import { authenticate } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// ─── CORS ────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Parse JSON request bodies (needed for POST /api/packages)
app.use(express.json());

// Health-check route
app.get("/", (_, res) => {
  res.json({
    message: "Courier Track API Running",
  });
});

// ─── Public Routes (no auth required) ────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/tracking", trackingRoutes);

// ─── Protected Routes (require login) ───────────────────
app.use("/api/packages", authenticate, packageRoutes);
app.use("/api/dashboard", authenticate, dashboardRoutes);
app.use("/api/regions", authenticate, regionRoutes);

// ─── Error Handler (must be AFTER all routes) ────────────
app.use(errorHandler);

export default app;
