import cors from "cors";
import express from "express";
import { authRouter } from "./auth.js";
import { clientsRouter } from "./routes/clients.js";
import { invRouter } from "./routes/investments.js";
import { summaryRouter } from "./routes/summary.js";
import { interestRouter } from "./routes/interest.js";
import { startScheduler } from "./lib/scheduler.js";
import { authRequired } from "./lib/authMiddleware.js";
import { prisma } from "./lib/prisma.js";  // ✅ make sure prisma client exists
import { transporter } from "./lib/mailer.js"; // ✅ your nodemailer transporter

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Allow frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ✅ Test email route
app.get("/api/test-email", async (_req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "Test Email",
      text: "✅ Your email setup works!",
    });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Test email error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ NEW: send due notifications
// ✅ NEW: send due notifications (summary email)
app.get("/api/send-due-notifications", async (_req, res) => {
  try {
    const today = new Date().getDate(); // current day of month

    const clients = await prisma.client.findMany({
      include: { investments: true },
    });

    // collect due clients
    let dueList = [];

    for (const client of clients) {
      for (const inv of client.investments) {
        if (inv.monthlyInterestDay === today) {
          dueList.push({
            name: client.name,
            amount: inv.interestAmount || 0,
            day: inv.monthlyInterestDay,
          });
        }
      }
    }

    if (dueList.length > 0) {
      // build email body
      const body = `
        <h2>📢 Payment Due Reminder</h2>
        <p>The following clients have payments due today:</p>
        <ul>
          ${dueList
            .map(
              (d) =>
                `<li><strong>${d.name}</strong> — ₹${d.amount.toFixed(
                  2
                )} (Monthly Int Day: ${d.day})</li>`
            )
            .join("")}
        </ul>
        <p>Please ensure payments are made today ✅</p>
      `;

      await transporter.sendMail({
        from: `"Innovate Capital" <${process.env.MAIL_USER}>`,
        to: ["1628uttamchauhan@gmail.com", "nirajchanda28@gmail.com"],
        cc: "innovatecapitalstartup@gmail.com",
        subject: "📢 Daily Payment Due Reminder",
        html: body,
      });
    }

    res.json({
      success: true,
      message: `✅ Notifications sent for ${dueList.length} clients`,
    });
  } catch (err) {
    console.error("❌ Notification send error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// Auth & API routes
app.use("/api/auth", authRouter);
app.use("/api/clients", authRequired, clientsRouter);
app.use("/api/investments", authRequired, invRouter);
app.use("/api/summary", authRequired, summaryRouter);
app.use("/api/interest", authRequired, interestRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startScheduler();
});
