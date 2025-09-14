import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.payment.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.client.deleteMany();

  const client = await prisma.client.create({
    data: {
      name: 'Client A',
      email: 'clienta@example.com',
      mobile: '9876543210',
      accountNumber: '1234567890',
      bankName: 'HDFC',
    }
  });

  const inv = await prisma.investment.create({
    data: {
      clientId: client.id,
      principal: 500000,
      rateMonthly: 4,
      startDate: new Date(),
      interestDay: 10,
      note: 'Sample investment'
    }
  });

  console.log('Seeded client:', client.name, 'investment id:', inv.id);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
