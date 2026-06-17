import express from "express";
import cors from "cors";
import packageRoutes from "./routes/package.route";
import dashboardRoutes from "./routes/dashboard.route";
import trackingRoutes from "./routes/tracking.route";
import regionRoutes from "./routes/region.route";
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

// ─── API Routes ──────────────────────────────────────────
app.use("/api/packages", packageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/regions", regionRoutes);

// ─── Error Handler (must be AFTER all routes) ────────────
app.use(errorHandler);

export default app;


