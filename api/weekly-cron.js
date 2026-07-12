// GET /api/weekly-cron
// Triggered on a schedule by Vercel Cron (see vercel.json).
// Loops through every user with notify_email = true and sends them
// their weekly report by calling the same logic as /api/send-report.

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Vercel Cron sends a GET request with this header — reject anything else
  // to stop the endpoint being triggered by a random visitor.
  const isCron = req.headers['x-vercel-cron'] || req.query.secret === process.env.CRON_SECRET
  if (!isCron) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('notify_email', true)

    if (error) throw error

    const results = []
    for (const profile of profiles) {
      try {
        // reuse send-report's logic via an internal fetch to keep one source of truth
        const resp = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''}/api/send-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profile.id }),
        })
        results.push({ userId: profile.id, ok: resp.ok })
      } catch (err) {
        results.push({ userId: profile.id, ok: false, error: err.message })
      }
    }

    return res.status(200).json({ processed: results.length, results })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Weekly cron failed' })
  }
}
