import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const ordersRoutes = Router();

function pad2(n) {
  return String(n).padStart(2, "0");
}
function nowHHMM() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function toFrontendOrder(order) {
  return {
    id: order.publicId,
    eventName: order.eventName,
    total: order.total,
    status: order.status,
    date: order.date,
    deliveryWindow: order.deliveryWindow,
    eco: order.eco,
    address: order.address,
    items: order.items.map((it) => ({ name: it.nameSnapshot, qty: it.qty })),
    updates: order.updates.map((u) => ({ time: u.time, text: u.text })),
  };
}

ordersRoutes.get("/", requireAuth, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: { items: true, updates: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders.map(toFrontendOrder));
  } catch (err) {
    next(err);
  }
});

ordersRoutes.post("/:publicId/cancel", requireAuth, async (req, res, next) => {
  try {
    const { publicId } = req.params;

    const order = await prisma.order.findFirst({
      where: { publicId, userId: req.user.userId },
      include: { items: true, updates: true },
    });

    if (!order) {
      const err = new Error("Order not found.");
      err.status = 404;
      throw err;
    }

    if (order.status !== "PREPARING") {
      const err = new Error("Only PREPARING orders can be cancelled.");
      err.status = 409;
      throw err;
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        updates: {
          create: { time: nowHHMM(), text: "Cancelled by customer." },
        },
      },
      include: { items: true, updates: true },
    });

    res.json(toFrontendOrder(updated));
  } catch (err) {
    next(err);
  }
});
