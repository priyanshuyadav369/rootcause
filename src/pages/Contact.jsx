import React from 'react'
import { Button } from '@/components/ui/Button'

export default function Contact() {
  return (
    <section className="max-w-xl mx-auto px-6 py-24">
      <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">CONTACT</p>
      <h1 className="font-display text-3xl text-ink mb-3">Questions or feedback?</h1>
      <p className="text-ink/60 mb-8">Send a message and we'll get back to you.</p>

      <form className="space-y-4">
        <input className="w-full border border-ink/15 rounded-card px-4 py-3 bg-white/60 text-sm" placeholder="Your name" />
        <input className="w-full border border-ink/15 rounded-card px-4 py-3 bg-white/60 text-sm" placeholder="Your email" />
        <textarea className="w-full border border-ink/15 rounded-card px-4 py-3 bg-white/60 text-sm min-h-32" placeholder="Your message" />
        <Button type="submit">Send message</Button>
      </form>
    </section>
  )
}
