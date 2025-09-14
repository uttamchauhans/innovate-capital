// server/src/routes/summary.js
import express from "express";
import dayjs from "dayjs";
import { prisma } from "../lib/prisma.js";

export const summaryRouter = express.Router();

summaryRouter.get("/", async (_req, res) => {
  try {
    const [clients, investments, payments] = await Promise.all([
      prisma.client.count(),
      prisma.investment.findMany({ include: { payments: true } }),
      prisma.payment.findMany(),
    ]);

    // Use moneyTransferred as "principal"
    const totalPrincipal = investments.reduce(
      (sum, i) => sum + (i.moneyTransferred || 0),
      0
    );

    // Calculate this month's due = expected interest
    const monthlyDue = investments.reduce((sum, i) => {
      const principal = i.moneyTransferred || 0;
      return sum + (principal * (i.rateMonthly || 0)) / 100;
    }, 0);

    // Calculate paid this month from Payment records
    const monthStart = dayjs().startOf("month");
    const monthlyPaid = payments
      .filter(
        (p) =>
          p.paid && dayjs(p.month).isSame(monthStart, "month")
      )
      .reduce((s, p) => s + p.amount, 0);

    res.json({
      clients,
      totalPrincipal,
      monthlyDue,
      monthlyPaid,
    });
  } catch (err) {
    console.error("❌ /summary error:", err);
    res.status(500).json({ error: err.message });
  }
});
