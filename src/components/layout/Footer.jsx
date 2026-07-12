import React from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-ink text-paper/60 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-6 h-6 rounded-sm bg-gold flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-ink" fill="currentColor">
                <path d="M6 18C6 10 11 6 18 6C18 13.5 14 18 8.5 18C7.6 18 6.7 18 6 18Z" />
              </svg>
            </span>
            <span className="font-display text-base text-paper">RootCause</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            A diagnostic record for every plant on your terrace or balcony — photograph, diagnose, treat.
          </p>
        </div>

        <div>
          <p className="font-mono text-[11px] tracking-[0.1em] text-paper/40 mb-3">PRODUCT</p>
          <ul className="space-y-2 text-sm">
            <li><a href="/#how-it-works" className="hover:text-gold transition-colors">How it works</a></li>
            <li><a href="/#shop" className="hover:text-gold transition-colors">Shop</a></li>
            <li><Link to="/signup" className="hover:text-gold transition-colors">Create account</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[11px] tracking-[0.1em] text-paper/40 mb-3">SUPPORT</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact us</Link></li>
            <li><Link to="/login" className="hover:text-gold transition-colors">Log in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <p className="max-w-6xl mx-auto px-6 text-xs font-mono text-paper/30">
          © {new Date().getFullYear()} RootCause. Built as a college major project.
        </p>
      </div>
    </footer>
  )
}
