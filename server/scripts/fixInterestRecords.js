// scripts/fixInterestRecords.js
import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("🔧 Fixing InterestRecords without investmentId...");

  // Find all interest records that don’t have investmentId
  const records = await prisma.interestRecord.findMany({
    where: { investmentId: null },
  });

  if (records.length === 0) {
    console.log("✅ No interest records need fixing!");
    return;
  }

  for (const record of records) {
    // Find the first investment for this client
    const investment = await prisma.investment.findFirst({
      where: { clientId: record.clientId },
      orderBy: { dateInvested: "asc" },
    });

    if (investment) {
      await prisma.interestRecord.update({
        where: { id: record.id },
        data: { investmentId: investment.id },
      });
      console.log(
        `✅ Fixed InterestRecord ${record.id}, linked to Investment ${investment.id}`
      );
    } else {
      console.warn(
        `⚠️ Client ${record.clientId} has no investments. InterestRecord ${record.id} left without investmentId.`
      );
    }
  }

  console.log("🎉 Done fixing interest records!");
}

main()
  .catch((e) => {
    console.error("❌ Error fixing records:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
