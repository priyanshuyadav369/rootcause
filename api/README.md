# RootCause 🌿

> This assignment prompt was shared by **Prathamesh Sir**.

A diagnostic record for terrace and balcony gardeners. Photograph a leaf or root, get an AI-generated diagnosis, and know exactly what mineral, compost, or pesticide fixes it — with a shop right there to buy it.

**Live URL:** [add your Vercel URL here once deployed]

---

## Project overview

Most first-time terrace/balcony gardeners have no one to ask when a plant starts struggling. RootCause solves that by turning a phone photo into a plain-language diagnosis and a specific, actionable fix — then keeps a running record for every plant so you can see it improve over time.

**Core features**

- Supabase email/password authentication with protected routes
- **My Plants** — full CRUD for plant records (name, species, location, status)
- **Scan** — upload a leaf/root photo → Groq Vision detects symptoms → Groq turns that into a diagnosis + treatment recommendation
- **Shop** — product catalog tagged by the deficiencies/pests they treat, cart, and order history (second CRUD flow)
- **Analytics dashboard** — Recharts visualizations of scans, issue types, and plant health over time
- **Ask AI** — chat interface grounded in the user's own plant/scan history
- **Reports** — weekly email digest (via Resend) of everything done that week, plus a manual "send now" button

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, React Router, Tailwind CSS |
| Auth / Database / Storage | Supabase |
| Image diagnosis | Groq Vision |
| Text generation | Groq |
| Email | Resend |
| Charts | Recharts |
| Hosting | Vercel |

## Getting started locally

```bash
git clone <this-repo-url>
cd rootcause
npm install
cp .env.example .env
```

Fill in `.env` with your **own new Supabase project's** URL and anon key (do not reuse a Micro/Minor project), plus your Groq and Resend keys. Then in the Supabase SQL editor, run the contents of `supabase/schema.sql` to create all tables, policies, and seed shop products.

While developing, disable **Confirm Email** under **Authentication → Providers** in Supabase for faster sign-up testing.

```bash
npm run dev
```

## Deployment

1. Push this repo to GitHub
2. Import it into Vercel
3. Add every environment variable from `.env.example` in the Vercel project settings
4. Deploy

## Screenshots

| | |
|---|---|
| **Landing page** | ![Landing](./screenshots/landing.png) |
| **Sign up** | ![Signup](./screenshots/signup.png) |
| **Dashboard** | ![Dashboard](./screenshots/dashboard.png) |
| **My Plants (CRUD)** | ![Plants](./screenshots/plants.png) |
| **Scan → Diagnosis** | ![Scan](./screenshots/scan.png) |
| **Shop** | ![Shop](./screenshots/shop.png) |
| **Cart & Orders** | ![Orders](./screenshots/orders.png) |
| **Analytics dashboard** | ![Analytics](./screenshots/analytics.png) |
| **Ask AI** | ![Ask AI](./screenshots/ask-ai.png) |
| **Reports** | ![Reports](./screenshots/reports.png) |

## Project status

Complete. All mandatory requirements — Supabase Auth, protected routes, two CRUD flows (Plants, Orders), a Recharts analytics dashboard, a landing page, Groq + Groq Vision integration, and Resend email — are implemented and working locally and in production.
