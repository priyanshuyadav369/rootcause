import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/dashboard')
  }

  return (
    <section className="max-w-md mx-auto px-6 py-24">
      <form onSubmit={handleSubmit} className="border border-ink/10 rounded-card p-8 bg-white/60">
        <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">LOG IN</p>
        <h1 className="font-display text-3xl text-ink mb-6">Welcome back</h1>

        <div className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/15 rounded-card px-4 py-3 bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Email"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/15 rounded-card px-4 py-3 bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Password"
          />
        </div>

        {error && (
          <p className="text-alert text-sm mt-4 bg-alert-light rounded-card px-3 py-2">{error}</p>
        )}

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>

        <p className="text-sm text-ink/60 mt-4">
          No account? <Link to="/signup" className="text-moss underline">Sign up</Link>
        </p>
      </form>
    </section>
  )
}
