import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sprout, ScanLine, AlertTriangle, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {
  const [email, setEmail] = useState('')
  const [stats, setStats] = useState({ totalPlants: 0, warnings: 0, scansThisWeek: 0, totalScans: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      setEmail(userData.user?.email ?? '')

      const [plantsRes, scansRes] = await Promise.all([
        supabase.from('plants').select('id, current_status'),
        supabase.from('scans').select('id, created_at'),
      ])

      const plants = plantsRes.data || []
      const scans = scansRes.data || []

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      setStats({
        totalPlants: plants.length,
        warnings: plants.filter((p) => p.current_status !== 'healthy').length,
        scansThisWeek: scans.filter((s) => new Date(s.created_at) >= weekAgo).length,
        totalScans: scans.length,
      })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="p-8 max-w-4xl">
      <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">DASHBOARD</p>
      <h1 className="font-display text-3xl text-ink mb-1">Welcome back</h1>
      <p className="text-ink/60 mb-8">{email}</p>

      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Sprout} label="Total plants" value={loading ? '—' : stats.totalPlants} accent="border-l-moss" />
        <StatCard icon={AlertTriangle} label="Active warnings" value={loading ? '—' : stats.warnings} accent="border-l-gold" />
        <StatCard icon={ScanLine} label="Scans this week" value={loading ? '—' : stats.scansThisWeek} accent="border-l-ink/30" />
        <StatCard icon={ScanLine} label="Total scans" value={loading ? '—' : stats.totalScans} accent="border-l-moss" />
      </div>

      <p className="font-mono text-[11px] tracking-[0.1em] text-ink/50 mb-4">QUICK ACTIONS</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <QuickAction to="/plants" icon={Sprout} title="Manage plants" body="Add, edit, or remove plants from your garden." />
        <QuickAction to="/scan" icon={ScanLine} title="Run a scan" body="Photograph a leaf or root to get a diagnosis." />
        <QuickAction to="/shop" icon={ShoppingBag} title="Visit the shop" body="Browse fertilizers, compost, and treatments." />
        <QuickAction to="/analytics" icon={AlertTriangle} title="View analytics" body="See scan trends and plant health over time." />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`border-l-4 ${accent} border-y border-r border-ink/10 rounded-card bg-white/60 px-5 py-4`}>
      <Icon className="w-4 h-4 text-ink/40 mb-2" />
      <p className="font-mono text-[10px] tracking-[0.1em] text-ink/45 mb-1">{label.toUpperCase()}</p>
      <p className="font-display text-2xl text-ink">{value}</p>
    </div>
  )
}

function QuickAction({ to, icon: Icon, title, body }) {
  return (
    <Link to={to} className="border border-ink/10 rounded-card bg-white/60 p-5 hover:border-moss transition-colors group">
      <Icon className="w-5 h-5 text-moss mb-3" />
      <p className="font-display text-lg text-ink mb-1 group-hover:text-moss transition-colors">{title}</p>
      <p className="text-sm text-ink/55">{body}</p>
    </Link>
  )
}
