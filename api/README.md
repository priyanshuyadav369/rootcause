# /api

Vercel serverless functions. In this project, most AI calls (Groq) happen
directly from the browser instead (see `src/lib/groq.js`) — matching the
"no separate backend" approach shown in the reference project. This folder
only exists for the two things that genuinely can't be done from the browser:

- `resend/emails.js` — a thin passthrough to Resend's API, so the Resend key
  never reaches the browser. Locally, `vite.config.js` does the same job via
  its dev proxy — this file is what takes over once deployed to Vercel.
- `send-report.js` + `weekly-cron.js` — the **automatic weekly** email job.
  This has to run server-side (no logged-in browser exists when a cron
  fires), using the Supabase service role key to read across all users.
  This only runs once deployed to Vercel with `SUPABASE_SERVICE_ROLE_KEY`
  and `RESEND_API_KEY` set in its project settings — nothing to test locally.
