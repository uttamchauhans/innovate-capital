import express from "express";
import { prisma } from "../lib/prisma.js";

export const interestRouter = express.Router();

/**
 * ➕ Create a new interest record
 * Requires: clientId, investmentId, interestReceived, profitCredited, profitDay
 */
interestRouter.post("/", async (req, res) => {
  try {
    const { clientId, investmentId, interestReceived, profitCredited, profitDay, note } = req.body;

    if (!investmentId) {
      return res.status(400).json({ error: "investmentId is required" });
    }

    const record = await prisma.interestRecord.create({
      data: {
        clientId: Number(clientId),
        investmentId: Number(investmentId), // ✅ must be linked
        interestReceived: Number(interestReceived),
        profitCredited: profitCredited ? Number(profitCredited) : 0,
        profitDay: new Date(profitDay),
        note: note || null,
      },
      include: { client: true, investment: true },
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("❌ Create interest error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📋 Get all interest records
 */
interestRouter.get("/", async (_req, res) => {
  try {
    const records = await prisma.interestRecord.findMany({
      include: { client: true, investment: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(records);
  } catch (err) {
    console.error("❌ Fetch interest error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✏️ Update interest record
 */
interestRouter.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { clientId, investmentId, interestReceived, profitCredited, profitDay, note } = req.body;

    const record = await prisma.interestRecord.update({
      where: { id },
      data: {
        ...(clientId ? { clientId: Number(clientId) } : {}),
        ...(investmentId ? { investmentId: Number(investmentId) } : {}),
        ...(interestReceived !== undefined ? { interestReceived: Number(interestReceived) } : {}),
        ...(profitCredited !== undefined ? { profitCredited: Number(profitCredited) } : {}),
        ...(profitDay ? { profitDay: new Date(profitDay) } : {}),
        ...(note !== undefined ? { note } : {}),
      },
      include: { client: true, investment: true },
    });

    res.json(record);
  } catch (err) {
    console.error("❌ Update interest error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🗑️ Delete interest record
 */
interestRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await prisma.interestRecord.deleteMany({ where: { id } });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Interest record not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete interest error:", err);
    res.status(500).json({ error: err.message });
  }
});
