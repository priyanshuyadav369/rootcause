import React, { useEffect, useState } from 'react'
import { Mail } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { sendWeeklyReport } from '@/lib/email'
import { Button } from '@/components/ui/Button'

export default function Reports() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    setLoading(true)
    const { data, error } = await supabase
      .from('weekly_reports')
      .select('*')
      .order('sent_at', { ascending: false })

    if (error) setError(error.message)
    else setHistory(data)
    setLoading(false)
  }

  async function sendNow() {
    setSending(true)
    setError('')
    setMessage('')

    try {
      const { data: userData } = await supabase.auth.getUser()
      await sendWeeklyReport()
      setMessage(`Summary sent to ${userData.user.email}.`)
      fetchHistory()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">REPORTS</p>
      <h1 className="font-display text-3xl text-ink mb-1">Weekly summary</h1>
      <p className="text-ink/60 mb-8">
        A digest of everything from the past week — plants added, scans run, issues found,
        and shop activity — plus what's currently flagged. Sent automatically every Monday
        once deployed, or any time with the button below.
      </p>

      <div className="border border-ink/10 rounded-card bg-white/60 p-6 mb-8">
        <p className="text-sm text-ink/70 mb-4 leading-relaxed">
          Click below to compile your recent activity and receive it by email right now.
        </p>
        <Button onClick={sendNow} disabled={sending}>
          <Mail className="w-4 h-4" />
          {sending ? 'Sending…' : 'Send summary now'}
        </Button>

        {message && (
          <p className="text-moss-dark text-sm bg-moss-light rounded-card px-3 py-2 mt-4">{message}</p>
        )}
        {error && (
          <p className="text-alert text-sm bg-alert-light rounded-card px-3 py-2 mt-4">{error}</p>
        )}
      </div>

      <p className="font-mono text-[11px] tracking-[0.1em] text-ink/50 mb-3">SEND HISTORY</p>
      {loading ? (
        <p className="font-mono text-xs tracking-[0.1em] text-ink/40">LOADING…</p>
      ) : history.length === 0 ? (
        <div className="border border-dashed border-ink/20 rounded-card p-8 text-center text-ink/40 text-sm">
          No reports sent yet.
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((r) => (
            <div key={r.id} className="border border-ink/10 rounded-card bg-white/60 px-5 py-3 flex items-center justify-between text-sm">
              <span className="text-ink/70">
                {new Date(r.sent_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-ink/50 font-mono text-xs">
                {r.summary_snapshot?.scans_this_week ?? 0} scans · {r.summary_snapshot?.active_warnings ?? 0} warnings
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
