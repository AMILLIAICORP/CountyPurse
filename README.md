# CountyPurse

Financial intelligence system for local government spending. Ingest county budgets in plain English, get structured analytics instantly.

## Stack

- **Next.js 14** (App Router)
- **Prisma** + **PostgreSQL** — data layer
- **NextAuth** — credentials-based auth
- **Stripe** — subscriptions ($499 Office / $2,400 Regional)
- **Claude API** — AI budget parsing

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks (see below) |
| `STRIPE_OFFICE_PRICE_ID` | Stripe Dashboard → Products → Office ($499/yr) |
| `STRIPE_REGIONAL_PRICE_ID` | Stripe Dashboard → Products → Regional ($2,400/yr) |
| `ANTHROPIC_API_KEY` | console.anthropic.com |

### 3. Set up Stripe products

In [Stripe Dashboard](https://dashboard.stripe.com/products):

1. Create product **"CountyPurse Office"** → recurring price → **$499 / year**
2. Create product **"CountyPurse Regional Office"** → recurring price → **$2,400 / year**
3. Copy both `price_xxx` IDs into `.env.local`

### 4. Set up Stripe webhook

```bash
# Install Stripe CLI for local dev
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

For production, add the webhook endpoint in Stripe Dashboard pointing to:
`https://countypurse.com/api/stripe/webhook`

Events to enable:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 5. Set up the database

```bash
npm run db:push      # Push schema to your database
npm run db:generate  # Generate Prisma client
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
app/
  page.tsx                  # Landing page
  pricing/page.tsx          # Pricing page
  signup/page.tsx           # Sign up → Stripe checkout
  login/page.tsx            # Login
  dashboard/
    layout.tsx              # Sidebar nav
    page.tsx                # Overview
    budgets/page.tsx        # Budget list
    analytics/page.tsx      # Spending analytics
    regional/page.tsx       # Multi-county (Regional plan)
  ingest/
    layout.tsx
    page.tsx                # Budget ingestion UI
  api/
    auth/
      [...nextauth]/        # NextAuth handler
      register/             # User registration
    stripe/
      checkout/             # Create checkout session
      webhook/              # Handle Stripe events
      portal/               # Billing portal
    budgets/
      route.ts              # List / delete budgets
      parse/route.ts        # Claude parsing
lib/
  auth.ts                   # NextAuth config
  prisma.ts                 # DB singleton
  stripe.ts                 # Stripe client + plan config
prisma/
  schema.prisma             # User, Budget models
middleware.ts               # Route protection
```

---

## Deployment (Vercel)

```bash
vercel --prod
```

Add all `.env.local` variables to your Vercel project environment variables.
Set `NEXTAUTH_URL` to your production domain.
