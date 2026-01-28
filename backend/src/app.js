import express from "express";
import cors from "cors";
import morgan from "morgan";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { authRoutes } from "./routes/auth.routes.js";
import { bouquetsRoutes } from "./routes/bouquets.routes.js";
import { ordersRoutes } from "./routes/orders.routes.js";
import { checkoutRoutes } from "./routes/checkout.routes.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "astral-bloom-backend" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/bouquets", bouquetsRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/checkout", checkoutRoutes);

  app.use(errorMiddleware);

  return app;
}
