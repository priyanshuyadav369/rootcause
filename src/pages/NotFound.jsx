import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <section className="max-w-md mx-auto px-6 py-32 text-center">
      <p className="font-mono text-[11px] tracking-[0.15em] text-ink/40 mb-3">RECORD NOT FOUND</p>
      <h1 className="font-display text-3xl text-ink mb-6">This page doesn't exist.</h1>
      <Button as={Link} to="/">Back to home</Button>
    </section>
  )
}
