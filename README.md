# Innovate Capital – Investment App

A full-stack web app for recording client investments, calculating monthly interest, tracking paid/unpaid, and automatically emailing monthly interest-due reminders.

## Tech
- Frontend: React (Vite) + Tailwind CSS + React Router + Recharts
- Backend: Node.js + Express + Prisma (SQLite)
- Email + Scheduler: Nodemailer + node-cron (Asia/Kolkata)
- Auth: Simple JWT with fixed admin creds (username `uttam`, password `uttam@123`).

## Prerequisites
- Node.js 18+

## Quick Start

```bash
# Backend
cd server
npm install
npx prisma migrate dev --name init
npm run seed        # optional: loads sample data
npm run dev         # server on http://localhost:4000

# Frontend
cd ../client
npm install
npm run dev         # app on http://localhost:5173
```

## Environment Variables (root `.env`)
```
ADMIN_USERNAME=uttam
ADMIN_PASSWORD=uttam@123
JWT_SECRET=supersecret_change_me

ADMIN_EMAIL=yourname@gmail.com
SMTP_USER=yourname@gmail.com
SMTP_PASS=your_gmail_app_password

PORT=4000
CLIENT_ORIGIN=http://localhost:5173
TZ=Asia/Kolkata
```

## Deploy
- **Backend**: Render/Railway. Set env vars from `.env`. Keep `TZ=Asia/Kolkata`. If SQLite persistence is not available, switch datasource to a hosted DB.
- **Frontend**: Vercel/Netlify. Set `VITE_API_URL` to backend URL.
