import { Router } from "express";
import { prisma } from "../db.js";

export const bouquetsRoutes = Router();


bouquetsRoutes.get("/", async (req, res, next) => {
  try {
    const { search, tag, eco, minPrice, maxPrice } = req.query;

    const where = {};

    if (typeof eco === "string") {
      if (eco === "true") where.eco = true;
      if (eco === "false") where.eco = false;
    }

    if (typeof search === "string" && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (typeof minPrice === "string" && minPrice.trim()) {
      where.price = { ...(where.price ?? {}), gte: Number(minPrice) };
    }

    if (typeof maxPrice === "string" && maxPrice.trim()) {
      where.price = { ...(where.price ?? {}), lte: Number(maxPrice) };
    }

    if (typeof tag === "string" && tag.trim()) {
      where.tags = {
        some: { tag: { equals: tag.trim(), mode: "insensitive" } },
      };
    }

    const bouquets = await prisma.bouquet.findMany({
      where,
      include: { tags: true },
      orderBy: { name: "asc" },
    });

    const result = bouquets.map((b) => ({
      id: b.id,
      name: b.name,
      price: b.price,
      defaultSize: b.defaultSize,
      eco: b.eco,
      tags: b.tags.map((t) => t.tag),
      description: b.description,
      imageUrl: b.imageUrl,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});
