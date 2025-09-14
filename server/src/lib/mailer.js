// server/src/lib/mailer.js
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // your Gmail
    pass: process.env.SMTP_PASS, // your Gmail app password
  },
});

export async function sendMail({ to, cc, subject, html }) {
  if (!to && !process.env.ADMIN_EMAIL) {
    throw new Error("Recipient email not set (no 'to' provided and ADMIN_EMAIL missing)");
  }

  const info = await transporter.sendMail({
    from: `Innovate Capital <${process.env.SMTP_USER}>`,
    to: to || process.env.ADMIN_EMAIL,
    cc,
    subject,
    html,
  });

  return info.messageId;
}
