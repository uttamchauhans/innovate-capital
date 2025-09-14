import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export const clientsRouter = express.Router();

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  mobile: z.string().optional().or(z.literal('')),
  accountNumber: z.string().optional().or(z.literal('')),
  bankName: z.string().optional().or(z.literal('')),
});

clientsRouter.get('/', async (_req, res) => {
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: { investments: true },
  });
  res.json(clients);
});

clientsRouter.post('/', async (req, res) => {
  const parsed = clientSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { email, ...rest } = parsed.data;

  try {
    const client = await prisma.client.create({
      data: { ...rest, email: email || null },
    });
    res.status(201).json(client);
  } catch (err) {
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return res.status(400).json({ error: 'Email already exists!' });
    }
    res.status(500).json({ error: err.message });
  }
});


clientsRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = clientSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { email, ...rest } = parsed.data;
  const client = await prisma.client.update({
    where: { id },
    data: { ...rest, email: email || null },
  });
  res.json(client);
});

clientsRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.investment.deleteMany({ where: { clientId: id } });
  await prisma.client.delete({ where: { id } });
  res.json({ success: true });
});

// ✅ Get single client with investments
clientsRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      investments: true,
      interestLogs: true, // also include interest records if needed
    },
  });

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  res.json(client);
});

// 🗑️ Delete client (and related investments)
clientsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.investment.deleteMany({ where: { clientId: id } });
    await prisma.interestRecord.deleteMany({ where: { clientId: id } });

    const deleted = await prisma.client.deleteMany({ where: { id } });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete client error:", err);
    res.status(500).json({ error: err.message });
  }
});


