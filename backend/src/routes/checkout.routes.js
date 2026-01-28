import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const checkoutRoutes = Router();

function pad2(n) {
  return String(n).padStart(2, "0");
}
function nowHHMM() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function makePublicId() {
  const d = new Date();
  const mmdd = `${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  const rand = Math.floor(100 + Math.random() * 900);
  return `AB-${mmdd}-${rand}`;
}
function isWarsawAddress(address) {
  const a = (address || "").toLowerCase();
  return a.includes("warsaw") || a.includes("warszawa");
}

async function payuAuthorizeStub({ amount }) {
  return {
    ok: true,
    provider: "PayU",
    status: "AUTHORIZED",
    transactionRef: `PAYU-${Date.now().toString().slice(-8)}`,
    amount,
  };
}

checkoutRoutes.post("/", requireAuth, async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      address,
      deliveryWindow,
      note,
      items,
      total,
    } = req.body;

    if (!fullName?.trim() || !address?.trim()) {
      const err = new Error("Missing required checkout fields.");
      err.status = 400;
      throw err;
    }
    if (!Array.isArray(items) || items.length === 0) {
      const err = new Error("Cart is empty.");
      err.status = 400;
      throw err;
    }
    if (!isWarsawAddress(address)) {
      const err = new Error("Delivery is available only in Warsaw.");
      err.status = 400;
      throw err;
    }

    const computedTotal = items.reduce(
      (sum, i) => sum + Number(i.qty || 0) * Number(i.price || 0),
      0
    );

    const payment = await payuAuthorizeStub({ amount: computedTotal });
    if (!payment.ok) {
      const err = new Error("Payment failed.");
      err.status = 402;
      throw err;
    }

    const eco = items.every((i) => Boolean(i.ecoOnly));

    const order = await prisma.order.create({
      data: {
        publicId: makePublicId(),
        userId: req.user.userId,
        eventName: `Same-day order — ${fullName.trim()}`,
        total: computedTotal,
        status: "PREPARING",
        date: todayISO(),
        deliveryWindow: deliveryWindow || "17:30–18:30",
        eco,
        address: address.trim(),
        phone: phone?.trim() || null,
        note: note?.trim() || null,

        items: {
          create: items.map((i) => ({
            bouquetId: i.id ?? null,
            nameSnapshot: String(i.name),
            qty: Number(i.qty),
            priceSnapshot: Number(i.price),
            ecoOnly: Boolean(i.ecoOnly),
            size: i.size ?? null,
          })),
        },

        updates: {
          create: [
            { time: nowHHMM(), text: "Payment authorised via PayU stub." },
            { time: nowHHMM(), text: "Order received and queued for preparation." },
            ...(note?.trim()
              ? [{ time: nowHHMM(), text: `Customer note: ${note.trim()}` }]
              : []),
          ],
        },

        payment: {
          create: {
            provider: payment.provider,
            status: payment.status,
            amount: payment.amount,
            transactionRef: payment.transactionRef,
          },
        },

        notifications: {
          create: [
            {
              channel: "email",
              message: `Order ${makePublicId()} created (demo notification).`,
            },
          ],
        },
      },
      include: {
        items: true,
        updates: true,
      },
    });

    res.status(201).json({
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
    });
  } catch (err) {
    next(err);
  }
});
