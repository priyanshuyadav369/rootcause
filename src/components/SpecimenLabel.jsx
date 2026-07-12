import React from 'react'
import { cn } from '@/lib/utils'

const STAMP = {
  healthy: { label: 'HEALTHY', color: 'bg-moss text-paper' },
  watch: { label: 'WATCH', color: 'bg-gold text-ink' },
  urgent: { label: 'URGENT', color: 'bg-alert text-paper' },
}

/**
 * SpecimenLabel — styled like a herbarium record tag.
 * rows: [{ label: 'ISSUE', value: 'Nitrogen deficiency' }, ...]
 * status: 'healthy' | 'watch' | 'urgent'
 */
export function SpecimenLabel({ title, subtitle, rows = [], status = 'watch', className }) {
  const stamp = STAMP[status] ?? STAMP.watch

  return (
    <div
      className={cn(
        'relative bg-paper border border-ink/15 rounded-card shadow-[0_1px_0_0_rgba(20,38,26,0.06)]',
        className
      )}
    >
      {/* hole-punch */}
      <div className="absolute -top-2.5 left-6 w-5 h-5 rounded-full bg-paper border border-ink/20" />

      <div className="flex items-start justify-between px-6 pt-6 pb-3 border-b border-dashed border-ink/20">
        <div>
          <p className="font-mono text-[11px] tracking-[0.15em] text-ink/50">SPECIMEN RECORD</p>
          <h3 className="font-display text-2xl text-ink leading-tight mt-1">{title}</h3>
          {subtitle && <p className="text-sm text-ink/60 mt-0.5">{subtitle}</p>}
        </div>
        <span
          className={cn(
            'font-mono text-[10px] tracking-[0.1em] px-2.5 py-1 rounded-sm shrink-0',
            stamp.color
          )}
        >
          {stamp.label}
        </span>
      </div>

      <dl className="px-6 py-4 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-4 text-sm">
            <dt className="font-mono text-[11px] tracking-[0.1em] text-ink/45 w-28 shrink-0 pt-0.5">
              {row.label}
            </dt>
            <dd className="text-ink/85 leading-snug">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
