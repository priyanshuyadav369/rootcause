import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'

export default function Signup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // Note: this assumes "Confirm Email" is disabled in Supabase
    // (Authentication -> Providers) as advised for development.
    // If it's enabled, the user won't have a session yet and should
    // be told to check their inbox instead of being redirected.
    navigate('/dashboard')
  }

  return (
    <section className="max-w-md mx-auto px-6 py-24">
      <form onSubmit={handleSubmit} className="border border-ink/10 rounded-card p-8 bg-white/60">
        <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">CREATE ACCOUNT</p>
        <h1 className="font-display text-3xl text-ink mb-6">Start your record</h1>

        <div className="space-y-4">
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-ink/15 rounded-card px-4 py-3 bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Full name"
          />
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/15 rounded-card px-4 py-3 bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Password (min. 6 characters)"
          />
        </div>

        {error && (
          <p className="text-alert text-sm mt-4 bg-alert-light rounded-card px-3 py-2">{error}</p>
        )}

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </Button>

        <p className="text-sm text-ink/60 mt-4">
          Already have an account? <Link to="/login" className="text-moss underline">Log in</Link>
        </p>
      </form>
    </section>
  )
}
