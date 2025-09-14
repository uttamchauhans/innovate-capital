import cron from "node-cron";
import dayjs from "dayjs";
import { prisma } from "./prisma.js";
import { sendMail } from "./mailer.js";

export function startScheduler() {
  // Run daily at 09:00 Asia/Kolkata
  cron.schedule("0 9 * * *", async () => {
    try {
      const today = dayjs();
      const day = today.date();

      const due = await prisma.investment.findMany({
        where: { monthlyInterestDay: day },
        include: { client: true },
      });

      if (due.length === 0) return;

      const rows = due
        .map((i) => {
          const amount = (i.moneyTransferred * i.rateMonthly) / 100;
          return `<tr>
            <td style="padding:6px 10px;border:1px solid #e5e7eb">${i.client.name}</td>
            <td style="padding:6px 10px;border:1px solid #e5e7eb">₹${i.moneyTransferred.toFixed(
              2
            )}</td>
            <td style="padding:6px 10px;border:1px solid #e5e7eb">${i.rateMonthly}%</td>
            <td style="padding:6px 10px;border:1px solid #e5e7eb">₹${amount.toFixed(
              2
            )}</td>
          </tr>`;
        })
        .join("");

      const html = `
        <div style="font-family:Inter,system-ui,Arial,sans-serif;font-size:14px;color:#111">
          <h2>📢 Monthly Interest Due – ${today.format("YYYY-MM-DD")}</h2>
          <p>The following investments have interest due today (day ${day}).</p>
          <table cellspacing="0" cellpadding="0" style="border-collapse:collapse">
            <thead>
              <tr>
                <th style="padding:6px 10px;border:1px solid #e5e7eb;background:#f8fafc">Client</th>
                <th style="padding:6px 10px;border:1px solid #e5e7eb;background:#f8fafc">Principal</th>
                <th style="padding:6px 10px;border:1px solid #e5e7eb;background:#f8fafc">Rate (monthly)</th>
                <th style="padding:6px 10px;border:1px solid #e5e7eb;background:#f8fafc">Interest</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;

      // ✅ Send to you + CC admin
      await sendMail({
        to: "1628uttamchauhan@gmail.com",
        cc: "nirajchanda28@gmail.com",
        subject: "Interest Due Today",
        html,
      });

      console.log("✅ Reminder email sent for", due.length, "items");
    } catch (err) {
      console.error("❌ Scheduler error", err);
    }
  });
}
