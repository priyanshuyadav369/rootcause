import { supabase } from './supabaseClient'

// In dev:  /api/resend/emails → Vite proxy → https://api.resend.com/emails
// In prod: /api/resend/emails → Vercel serverless → https://api.resend.com/emails
const RESEND_URL = '/api/resend/emails'
const RESEND_FROM = 'RootCause <onboarding@resend.dev>'

async function postEmail(payload) {
  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.json()
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

/**
 * Builds and sends the weekly digest for the CURRENTLY LOGGED IN user.
 * All data is fetched with the browser's own Supabase session, so Row Level
 * Security already scopes every query to this user — no service role key
 * needed for this manual path.
 */
export async function sendWeeklyReport() {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) throw new Error('Not logged in')
  const user = userData.user

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [{ data: plants }, { data: scans }, { data: orders }] = await Promise.all([
    supabase.from('plants').select('id, name, current_status, created_at'),
    supabase
      .from('scans')
      .select('id, detected_issue, severity, recommended_action, created_at, plant:plants(name)')
      .gte('created_at', weekAgo.toISOString()),
    supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .gte('created_at', weekAgo.toISOString()),
  ])

  const warnings = (plants || []).filter((p) => p.current_status !== 'healthy')
  const scansThisWeek = scans || []
  const ordersThisWeek = orders || []

  const summary = {
    scans_this_week: scansThisWeek.length,
    active_warnings: warnings.length,
    orders_this_week: ordersThisWeek.length,
  }

  const html = buildEmailHtml({ email: user.email, plants, scansThisWeek, warnings, ordersThisWeek })

  await postEmail({
    from: RESEND_FROM,
    to: [user.email],
    subject: `Your RootCause weekly summary — ${scansThisWeek.length} scan(s), ${warnings.length} plant(s) need attention`,
    html,
  })

  // log the send — requires an insert policy on weekly_reports scoped to
  // auth.uid() = user_id (see supabase/schema.sql)
  await supabase.from('weekly_reports').insert({
    user_id: user.id,
    summary_snapshot: summary,
  })

  return summary
}
