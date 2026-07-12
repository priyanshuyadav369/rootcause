import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  return (
    <header className="bg-ink text-paper">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-7 h-7 rounded-sm bg-gold flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-ink" fill="currentColor">
              <path d="M6 18C6 10 11 6 18 6C18 13.5 14 18 8.5 18C7.6 18 6.7 18 6 18Z" />
            </svg>
          </span>
          <span className="font-display text-lg tracking-tight">RootCause</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-mono text-[12px] tracking-[0.08em] uppercase text-paper/70">
          <a href="/#how-it-works" className="hover:text-gold transition-colors">How it works</a>
          <a href="/#shop" className="hover:text-gold transition-colors">Shop</a>
          <a href="/contact" className="hover:text-gold transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <Button as={Link} to="/login" variant="ghost" size="sm" className="text-paper hover:bg-white/10 hover:text-paper">
            Log in
          </Button>
          <Button as={Link} to="/signup" variant="gold" size="sm">
            Get started
          </Button>
        </div>
      </div>
    </header>
  )
}
