import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SpecimenLabel } from '@/components/SpecimenLabel'

const FEATURES = [
  {
    tag: 'FIELD 01',
    title: 'Photograph a leaf or root',
    body: 'Take a photo the same way you already check on your plants — no special equipment, no lab. Just your phone camera.',
  },
  {
    tag: 'FIELD 02',
    title: 'Get a plain-language diagnosis',
    body: 'RootCause reads the photo for discoloration, spotting, wilting, and root damage, then explains what it actually means.',
  },
  {
    tag: 'FIELD 03',
    title: 'Know exactly what to buy',
    body: 'Every diagnosis comes with a specific fix — the mineral, compost, or pesticide it calls for — linked straight to the shop.',
  },
  {
    tag: 'FIELD 04',
    title: 'Keep a record for every plant',
    body: 'Each plant on your terrace gets its own history: every scan, every treatment, every recovery, in one place.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Add your plant',
    body: 'Name it, note where it lives — balcony rail, terrace corner, windowsill — and you\u2019re set up.',
  },
  {
    n: '02',
    title: 'Scan when something looks off',
    body: 'Curling leaves, yellow patches, mushy roots — photograph it and let the diagnosis run.',
  },
  {
    n: '03',
    title: 'Treat and track',
    body: 'Apply what\u2019s recommended, and watch the plant\u2019s status move from watch back to healthy over time.',
  },
]

const SHOP_PREVIEW = [
  { name: 'Cocopeat Block', note: 'For water retention & aeration', price: '₹149' },
  { name: 'Vermicompost, 2kg', note: 'Slow-release organic nutrition', price: '₹199' },
  { name: 'Neem Oil Concentrate', note: 'For fungal & pest issues', price: '₹229' },
]

export default function Landing() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-ink text-paper overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
          <div>
            <p className="font-mono text-[12px] tracking-[0.15em] text-gold mb-5">
              FOR TERRACE &amp; BALCONY GROWERS
            </p>
            <h1 className="font-display text-[2.75rem] leading-[1.1] sm:text-6xl sm:leading-[1.08] mb-6">
              Your plant has something to tell you.
            </h1>
            <p className="text-paper/70 text-lg leading-relaxed max-w-md mb-9">
              Photograph a leaf or root and RootCause reads the signs — deficiency, pest,
              fungal, or stress — then tells you the exact fix, no gardening background required.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button as={Link} to="/signup" variant="gold" size="lg">
                Start diagnosing — free
              </Button>
              <Button as="a" href="#how-it-works" variant="onDark" size="lg" className="bg-transparent border border-paper/25 text-paper hover:bg-paper hover:text-ink">
                See how it works
              </Button>
            </div>
          </div>

          <div className="relative">
            <SpecimenLabel
              title="Tulsi — Balcony Pot 2"
              subtitle="Leaf scan · Today, 9:14 AM"
              status="watch"
              rows={[
                { label: 'ISSUE', value: 'Nitrogen deficiency' },
                { label: 'SIGNS', value: 'Pale lower leaves, slowed new growth' },
                { label: 'RX', value: 'Apply vermicompost, 1 tbsp per pot, weekly' },
                { label: 'RE-SCAN', value: 'In 10 days' },
              ]}
              className="shadow-2xl shadow-black/30 rotate-[-1.5deg]"
            />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gold/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* PROBLEM FRAMING */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-ink mb-5">
          Most terrace gardens fail quietly
        </h2>
        <p className="text-ink/60 text-lg leading-relaxed">
          A leaf yellows, a stem droops, and there's no one to ask. By the time it's obvious
          something is wrong, it's often too late to fix cheaply. RootCause exists to catch it
          early and tell you, in plain terms, exactly what the plant needs.
        </p>
      </section>

      {/* FEATURES */}
      <section className="bg-moss-light/60 border-y border-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="font-mono text-[12px] tracking-[0.15em] text-moss-dark mb-3">WHAT IT DOES</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink mb-12 max-w-xl">
            Everything between "something's wrong" and "it's handled."
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-paper border border-ink/10 rounded-card p-7">
                <p className="font-mono text-[11px] tracking-[0.12em] text-gold mb-4">{f.tag}</p>
                <h3 className="font-display text-xl text-ink mb-2">{f.title}</h3>
                <p className="text-ink/60 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <p className="font-mono text-[12px] tracking-[0.15em] text-moss mb-3">HOW IT WORKS</p>
        <h2 className="font-display text-3xl sm:text-4xl text-ink mb-14 max-w-xl">
          Three steps, start to finish.
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative pl-0">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-3xl text-ink/15">{s.n}</span>
                <div className="h-px flex-1 bg-ink/10" />
              </div>
              <h3 className="font-display text-xl text-ink mb-2">{s.title}</h3>
              <p className="text-ink/60 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP TEASER */}
      <section id="shop" className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-mono text-[12px] tracking-[0.15em] text-gold mb-3">THE SHOP</p>
              <h2 className="font-display text-3xl sm:text-4xl max-w-lg">
                Every diagnosis links to what actually fixes it.
              </h2>
            </div>
            <p className="text-paper/60 max-w-sm text-sm leading-relaxed">
              No guessing what to buy — RootCause tags every product to the deficiencies and
              pests it treats, and matches it to your scan result.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {SHOP_PREVIEW.map((p) => (
              <div key={p.name} className="border border-paper/15 rounded-card p-6 bg-white/[0.03]">
                <div className="flex items-center justify-center h-28 mb-5 border border-dashed border-paper/20 rounded-sm">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-gold/70" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M4 8L12 4l8 4v8l-8 4-8-4V8z" />
                    <path d="M4 8l8 4 8-4M12 12v8" />
                  </svg>
                </div>
                <h3 className="font-display text-lg mb-1">{p.name}</h3>
                <p className="text-paper/50 text-xs mb-4">{p.note}</p>
                <p className="font-mono text-gold text-sm">{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-ink mb-5">
          Start your terrace garden's record today
        </h2>
        <p className="text-ink/60 text-lg mb-9 max-w-md mx-auto">
          Free to start. Add your first plant and run your first scan in under two minutes.
        </p>
        <Button as={Link} to="/signup" variant="primary" size="lg">
          Create free account
        </Button>
      </section>
    </>
  )
}
