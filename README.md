# RootCause 🌿

> This assignment prompt was shared by **Prathamesh Sir**.

A diagnostic record for terrace and balcony gardeners. Photograph a leaf or root, get an AI-generated diagnosis, and know exactly what mineral, compost, or pesticide fixes it — with a shop right there to buy it.

---

## Project overview

Most first-time terrace/balcony gardeners have no one to ask when a plant starts struggling. RootCause solves that by turning a phone photo into a plain-language diagnosis and a specific, actionable fix — then keeps a running record for every plant so you can see it improve over time.

**Core features**

- Supabase email/password authentication with protected routes
- **My Plants** — full CRUD for plant records (name, species, location, status)
- **Scan** — upload a leaf/root photo → Groq Vision detects symptoms → Groq (text) turns that into a diagnosis + treatment recommendation
- **Shop** — product catalog tagged by the deficiencies/pests they treat, cart, and order history (second CRUD flow)
- **Analytics dashboard** — Recharts visualizations of scans, issue types, and plant health over time
- **Ask AI** — chat interface grounded in the user's own plant/scan history
- **Reports** — weekly email digest (via Resend) of everything done that week, plus a manual "send now" button

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, React Router, Tailwind CSS, shadcn/ui-style components |
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

Fill in `.env` with your **own new Supabase project's** URL and anon key (do not reuse a Micro/Minor project). Then in the Supabase SQL editor, run the contents of `supabase/schema.sql` to create all tables, policies, and seed shop products.

While developing, disable **Confirm Email** under **Authentication → Providers** in Supabase for faster sign-up testing.

```bash
npm run dev
```

## Deployment

- Push this repo to GitHub
- Import it into Vercel
- Add the environment variables from `.env.example` in the Vercel project settings (the non-`VITE_` ones are used by the serverless functions in `/api`)
- Deploy

## Screenshots

_Add screenshots here once each page is built:_

- [ ] Landing page
- [ ] Sign up / Log in
- [ ] Dashboard
- [ ] My Plants (CRUD)
- [ ] Scan → Diagnosis result
- [ ] Shop / Cart / Orders
- [ ] Analytics dashboard
- [ ] Ask AI
- [ ] Reports

## Project status

This is a work in progress, built incrementally. Current state: project scaffold, design system, landing page, routing (public + protected), and the full Supabase schema are in place. Auth wiring, CRUD screens, the Groq scan pipeline, the shop/cart/order flow, analytics, and the Resend reports are being built next.
