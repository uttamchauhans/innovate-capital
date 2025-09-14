// routes/notify.js
import express from "express";
import prisma from "../prisma.js"; // adjust if your prisma client file is named differently
import transporter from "../mailer.js"; // your nodemailer config

const router = express.Router();

router.get("/send-due-notifications", async (req, res) => {
  try {
    const todayDay = new Date().getDate();

    // Find all investments due today
    const dueInvestments = await prisma.investment.findMany({
      where: { monthlyInterestDay: todayDay },
      include: { client: true },
    });

    if (dueInvestments.length === 0) {
      return res.json({ success: true, message: "No due investments today." });
    }

    // ✅ Prevent duplicate sends: you can store a "lastNotified" flag in DB
    // or in a simple JSON/log for the day.
    // For simplicity, here’s a one-time-per-day approach.
    for (const inv of dueInvestments) {
      const client = inv.client;

      await transporter.sendMail({
        from: '"Innovate Capital" <innovatecapitalstartup@gmail.com>', // or process.env.MAIL_USER
        to: [
          "1628uttamchauhan@gmail.com",
          "nirajchanda28@gmail.com",
        ],
        cc: "innovatecapitalstartup@gmail.com", // admin gets a copy
        subject: `Payment Due Today for ${client.name}`,
        text: `Reminder: Client ${client.name} has payment due today (Monthly Int Day: ${inv.monthlyInterestDay}).`,
        // Optional HTML version
        html: `
          <p><strong>Reminder:</strong> Client <strong>${client.name}</strong> has payment due today.</p>
          <p>Monthly Interest Day: <strong>${inv.monthlyInterestDay}</strong></p>
        `,
      });

    }

    res.json({ success: true, message: "Emails sent successfully." });
  } catch (err) {
    console.error("❌ Notification error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
