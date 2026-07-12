// POST /api/send-report
// Body: { userId: string }  -- called with the logged-in user's id from the
//                              manual "Send Now" button, or looped over by
//                              the weekly cron job for every opted-in user.
// Returns: { sent: true, summary: {...} }
//
// Uses the Supabase SERVICE ROLE key (server-side only) so it can read across
// RLS and look up the user's email, then sends via Resend and logs to
// weekly_reports.

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.body || {}
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured on the server' })
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server' })
  }

  try {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: userRes, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (userErr || !userRes?.user) throw new Error('Could not find user')
    const email = userRes.user.email

    const [{ data: plants }, { data: scans }, { data: orders }] = await Promise.all([
      supabaseAdmin.from('plants').select('id, name, current_status, created_at').eq('user_id', userId),
      supabaseAdmin
        .from('scans')
        .select('id, detected_issue, severity, recommended_action, created_at, plant:plants(name)')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString()),
      supabaseAdmin
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString()),
    ])

    const newPlants = (plants || []).filter((p) => new Date(p.created_at) >= weekAgo)
    const warnings = (plants || []).filter((p) => p.current_status !== 'healthy')
    const scansThisWeek = scans || []
    const ordersThisWeek = orders || []

    const summary = {
      new_plants: newPlants.length,
      scans_this_week: scansThisWeek.length,
      active_warnings: warnings.length,
      orders_this_week: ordersThisWeek.length,
    }

    const html = buildEmailHtml({ email, plants, scansThisWeek, warnings, ordersThisWeek })

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'RootCause <onboarding@resend.dev>',
        to: email,
        subject: `Your RootCause weekly summary — ${scansThisWeek.length} scan(s), ${warnings.length} plant(s) need attention`,
        html,
      }),
    })

    if (!resendResp.ok) {
      const text = await resendResp.text()
      throw new Error(`Resend error (${resendResp.status}): ${text}`)
    }

    await supabaseAdmin.from('weekly_reports').insert({
      user_id: userId,
      summary_snapshot: summary,
    })

    return res.status(200).json({ sent: true, summary })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Sending report failed' })
  }
}

function buildEmailHtml({ email, plants, scansThisWeek, warnings, ordersThisWeek }) {
  const plantRows = (plants || [])
    .map((p) => `<li>${p.name} — <strong>${p.current_status}</strong></li>`)
    .join('')

  const scanRows = scansThisWeek
    .map(
      (s) =>
        `<li>${s.plant?.name ?? 'A plant'}: ${s.detected_issue} (${s.severity}) — ${s.recommended_action}</li>`
    )
    .join('')

  const orderRows = ordersThisWeek
    .map((o) => `<li>Order ₹${Number(o.total_amount).toFixed(2)} — ${o.status}</li>`)
    .join('')

  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #14261A;">
      <h1 style="font-size: 22px;">Your week on RootCause</h1>
      <p style="color: #555;">A summary for ${email}</p>

      <h2 style="font-size: 16px; margin-top: 24px;">Plant status</h2>
      <ul>${plantRows || '<li>No plants added yet.</li>'}</ul>

      <h2 style="font-size: 16px; margin-top: 24px;">Scans this week</h2>
      <ul>${scanRows || '<li>No scans this week.</li>'}</ul>

      <h2 style="font-size: 16px; margin-top: 24px;">Shop activity</h2>
      <ul>${orderRows || '<li>No orders this week.</li>'}</ul>

      <p style="margin-top: 32px; font-size: 12px; color: #888;">
        ${warnings.length > 0 ? `⚠️ ${warnings.length} plant(s) currently need attention.` : 'All plants are currently healthy.'}
      </p>
    </div>
  `
}
