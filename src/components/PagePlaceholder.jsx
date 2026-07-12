import React from 'react'

export function PagePlaceholder({ title, tag, body }) {
  return (
    <div className="p-8 max-w-2xl">
      <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">{tag}</p>
      <h1 className="font-display text-3xl text-ink mb-3">{title}</h1>
      <p className="text-ink/60 leading-relaxed">{body}</p>
      <div className="mt-8 border border-dashed border-ink/20 rounded-card p-8 text-center text-ink/30 font-mono text-xs tracking-[0.1em]">
        BUILT IN THE NEXT STEP
      </div>
    </div>
  )
}
