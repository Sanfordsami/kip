
# KPI Management System — Addis Reality

An internal KPI task assignment and tracking system built for Addis Reality (AR Solutions PLC). Managers assign KPI tasks to employees, who are notified instantly via Telegram (with tappable status buttons) and/or email, and can track and update their progress from a personal dashboard.

## Features

- **KPI Task Assignment** — managers assign tasks to one or more employees, with priority, due date, weight, and notes
- **Telegram Bot Notifications** — instant delivery with inline buttons (`In Progress`, `Finished`, `Reject`) that update status directly from Telegram
- **Email + Telegram Campaigns** — send broadcast messages to groups of employees filtered by role, via Brevo (email) and/or Telegram
- **Assignment History** — searchable, filterable, sortable log of every assignment, with delivery status per notification
- **Employee Dashboard** — each employee sees only their own assigned tasks and can update status
- **Manager Admin Panel** — sidebar-driven admin area for managing employees, KPI tasks, and campaigns
- **Authentication** — Supabase Auth–backed login, with route protection via Next.js middleware based on employee role
- **Role-based access** — `manager`, `sales`, `support`, `engineering`, `marketing`

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Database client:** `@supabase/supabase-js`
- **Authentication:** Supabase Auth (`@supabase/ssr` for cookie-based sessions)
- **Validation:** Zod
- **Notifications:** Telegram Bot API, Brevo (transactional email)
- **UI primitives:** Radix UI + custom components

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Supabase — database connection (from Project Settings → Database)
DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-x-region.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxxx:PASSWORD@aws-x-region.pooler.supabase.com:5432/postgres"

# Supabase — API access (from Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"

# Telegram Bot (from @BotFather)
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_WEBHOOK_SECRET="a-random-secret-string"

# Brevo (transactional email)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="your-verified-sender@example.com"
BREVO_SENDER_NAME="Addis Reality KPI"
```

⚠️ Never commit `.env.local` — it's already listed in `.gitignore`.

### 3. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (or the next available port if 3000 is in use).

### 4. Set up the Telegram webhook (local development)

Telegram needs a public URL to send button-tap events to. For local testing, use [ngrok](https://ngrok.com):

```bash
ngrok http 3001   # match whatever port your dev server is running on
```

Then register the webhook with the ngrok URL it gives you:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_NGROK_URL/api/telegram/webhook", "secret_token": "<TELEGRAM_WEBHOOK_SECRET>"}'
```

