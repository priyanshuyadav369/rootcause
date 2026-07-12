import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { askAI } from '@/lib/groq'
import { Button } from '@/components/ui/Button'

const SUGGESTIONS = [
  'Which of my plants need attention right now?',
  'What issues have come up most often?',
  "What should I buy for my plants' current problems?",
  'How is my terrace garden doing overall?',
]

export default function Insights() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function ask(question) {
    if (!question.trim()) return
    setLoading(true)
    setError('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')

    try {
      const [{ data: plants }, { data: scans }] = await Promise.all([
        supabase.from('plants').select('name, species, location, current_status'),
        supabase
          .from('scans')
          .select('detected_issue, severity, recommended_action, created_at, plant:plants(name)')
          .order('created_at', { ascending: false })
          .limit(30),
      ])

      const answer = await askAI(question, { plants, recent_scans: scans })
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl flex flex-col h-screen">
      <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">ASK AI</p>
      <h1 className="font-display text-3xl text-ink mb-1">Ask about your plants</h1>
      <p className="text-ink/60 mb-6">Grounded in your own plant and scan history.</p>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="text-left text-sm border border-ink/15 rounded-card px-4 py-2.5 bg-white/50 hover:border-moss transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-card px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-moss text-paper ml-auto'
                : 'bg-white/70 border border-ink/10 text-ink/85'
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="bg-white/70 border border-ink/10 rounded-card px-4 py-3 text-sm text-ink/40 font-mono max-w-[85%]">
            Thinking…
          </div>
        )}
      </div>

      {error && (
        <p className="text-alert text-sm bg-alert-light rounded-card px-3 py-2 mb-3">{error}</p>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); ask(input) }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about your plants…"
          className="flex-1 border border-ink/15 rounded-card px-4 py-3 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <Button type="submit" disabled={loading}>Ask</Button>
      </form>
    </div>
  )
}
