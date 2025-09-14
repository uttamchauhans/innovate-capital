import { prisma } from '../src/lib/prisma.js'

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing
  await prisma.payment.deleteMany()
  await prisma.investment.deleteMany()
  await prisma.interestRecord.deleteMany()
  await prisma.client.deleteMany()

  // Create sample client
  const client = await prisma.client.create({
    data: {
      name: 'Amit Sharma',
      email: 'amit@example.com',
      mobile: '9876543210',
      accountNumber: '1234567890',
      bankName: 'HDFC Bank',
    },
  })

  // Create investment for client
  const investment = await prisma.investment.create({
    data: {
      clientId: client.id,
      amountReceived: 500000,          // amount received from client
      moneyTransferred: 450000,        // money transferred to company
      dateInvested: new Date('2025-01-15'),
      rateMonthly: 3.5,                // interest % given to client
      dateInterestStart: new Date('2025-02-01'),
      monthlyInterestDay: 15,
      interestAmount: 17500,           // interest amount to client
      note: 'Priority investor with flexible terms',
    },
  })

  // Create sample payment
  await prisma.payment.create({
    data: {
      investmentId: investment.id,
      month: new Date('2025-02-01'),
      amount: 17500,
      paid: true,
      paidAt: new Date('2025-02-15'),
    },
  })

  // Create sample interest received record
  await prisma.interestRecord.create({
    data: {
      clientId: client.id,
      interestReceived: 20000,         // received from company
      profitCredited: 2500,            // profit to admin
      profitDay: new Date('2025-02-20'),
      note: 'Quarterly profit distribution',
    },
  })

  console.log('✅ Seeding complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
