import express from 'express'
import { z } from 'zod'
import dayjs from 'dayjs'
import { prisma } from '../lib/prisma.js'

export const invRouter = express.Router()

// ✅ New validation schema
const invSchema = z.object({
  clientId: z.number(),
  amountReceived: z.number().positive(),
  moneyTransferred: z.number().optional(),
  dateInvested: z.string(), // ISO date
  rateMonthly: z.number().positive(),
  dateInterestStart: z.string().optional(), // ISO date
  monthlyInterestDay: z.number().int().min(1).max(31),
  interestAmount: z.number().optional(),
  note: z.string().optional().or(z.literal('')),
})

// 📋 Get all investments
invRouter.get('/', async (_req, res) => {
  const items = await prisma.investment.findMany({
    include: { client: true, payments: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(items)
})

// ➕ Create investment
invRouter.post('/', async (req, res) => {
  const parsed = invSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json(parsed.error)

  const data = parsed.data
  const inv = await prisma.investment.create({
    data: {
      clientId: data.clientId,
      amountReceived: data.amountReceived,
      moneyTransferred: data.moneyTransferred ?? null,
      dateInvested: new Date(data.dateInvested),
      rateMonthly: data.rateMonthly,
      dateInterestStart: data.dateInterestStart ? new Date(data.dateInterestStart) : null,
      monthlyInterestDay: data.monthlyInterestDay,
      interestAmount: data.interestAmount ?? null,
      note: data.note || null,
    },
  })
  res.status(201).json(inv)
})

// ✏️ Update investment
invRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = invSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json(parsed.error)

  const data = parsed.data
  const inv = await prisma.investment.update({
    where: { id },
    data: {
      ...(data.clientId ? { clientId: data.clientId } : {}),
      ...(data.amountReceived ? { amountReceived: data.amountReceived } : {}),
      ...(data.moneyTransferred !== undefined ? { moneyTransferred: data.moneyTransferred } : {}),
      ...(data.dateInvested ? { dateInvested: new Date(data.dateInvested) } : {}),
      ...(data.rateMonthly ? { rateMonthly: data.rateMonthly } : {}),
      ...(data.dateInterestStart ? { dateInterestStart: new Date(data.dateInterestStart) } : {}),
      ...(data.monthlyInterestDay ? { monthlyInterestDay: data.monthlyInterestDay } : {}),
      ...(data.interestAmount !== undefined ? { interestAmount: data.interestAmount } : {}),
      note: data.note ?? undefined,
    },
  })
  res.json(inv)
})

// 🗑️ Delete investment (and its payments)
// invRouter.delete('/:id', async (req, res) => {
//   const id = Number(req.params.id)
//   await prisma.payment.deleteMany({ where: { investmentId: id } })
//   await prisma.investment.delete({ where: { id } })
//   res.json({ success: true })
// })

// 💵 Mark monthly interest as paid/unpaid
invRouter.post('/:id/payments', async (req, res) => {
  const id = Number(req.params.id)
  const { month, amount, paid } = req.body // month: YYYY-MM
  const date = dayjs(month + '-01').toDate()

  const p = await prisma.payment.upsert({
    where: { investmentId_month: { investmentId: id, month: date } },
    update: {
      amount: Number(amount),
      paid: !!paid,
      paidAt: paid ? new Date() : null,
    },
    create: {
      investmentId: id,
      month: date,
      amount: Number(amount),
      paid: !!paid,
      paidAt: paid ? new Date() : null,
    },
  })
  res.json(p)
})
invRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.payment.deleteMany({ where: { investmentId: id } });

    const deleted = await prisma.investment.deleteMany({ where: { id } });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Investment not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete investment error:", err);
    res.status(500).json({ error: err.message });
  }
});

