import React, { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { supabase } from '@/lib/supabaseClient'

const INK = '#14261A'
const MOSS = '#3B6142'
const GOLD = '#D9A62E'
const ALERT = '#9C3B2E'
const SEVERITY_COLORS = { low: MOSS, medium: GOLD, high: ALERT }

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function Analytics() {
  const [plants, setPlants] = useState([])
  const [scans, setScans] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [plantsRes, scansRes, ordersRes] = await Promise.all([
        supabase.from('plants').select('id, location, current_status'),
        supabase.from('scans').select('id, severity, detected_issue, created_at'),
        supabase.from('orders').select('id, total_amount, status'),
      ])
      setPlants(plantsRes.data || [])
      setScans(scansRes.data || [])
      setOrders(ordersRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="p-8"><p className="font-mono text-xs tracking-[0.1em] text-ink/40">LOADING…</p></div>
  }

  // --- Scans per week (last 6 weeks) ---
  const weekBuckets = {}
  scans.forEach((s) => {
    const wk = startOfWeek(s.created_at).toISOString().slice(0, 10)
    weekBuckets[wk] = (weekBuckets[wk] || 0) + 1
  })
  const scansPerWeek = Object.entries(weekBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([week, count]) => ({
      week: new Date(week).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      scans: count,
    }))

  // --- Severity breakdown ---
  const severityCounts = { low: 0, medium: 0, high: 0 }
  scans.forEach((s) => { severityCounts[s.severity] = (severityCounts[s.severity] || 0) + 1 })
  const severityData = Object.entries(severityCounts)
    .filter(([, v]) => v > 0)
    .map(([severity, value]) => ({ name: severity, value }))

  // --- Plants by location ---
  const locationCounts = {}
  plants.forEach((p) => { locationCounts[p.location] = (locationCounts[p.location] || 0) + 1 })
  const locationData = Object.entries(locationCounts).map(([location, count]) => ({ location, count }))

  // --- Stat cards ---
  const totalPlants = plants.length
  const activeWarnings = plants.filter((p) => p.current_status !== 'healthy').length
  const totalScans = scans.length
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_amount), 0)

  const mostCommonIssue = (() => {
    const counts = {}
    scans.forEach((s) => { if (s.detected_issue) counts[s.detected_issue] = (counts[s.detected_issue] || 0) + 1 })
    const entries = Object.entries(counts).sort(([, a], [, b]) => b - a)
    return entries[0]?.[0] ?? '—'
  })()

  return (
    <div className="p-8 max-w-5xl">
      <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">ANALYTICS</p>
      <h1 className="font-display text-3xl text-ink mb-8">Real-time overview of your garden</h1>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total plants" value={totalPlants} accent="border-l-moss" />
        <StatCard label="Active warnings" value={activeWarnings} accent="border-l-gold" />
        <StatCard label="Total scans" value={totalScans} accent="border-l-ink/30" />
        <StatCard label="Shop revenue" value={`₹${totalRevenue.toFixed(0)}`} accent="border-l-moss" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Scans per week">
          {scansPerWeek.length === 0 ? (
            <EmptyChart label="No scans yet" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={scansPerWeek}>
                <CartesianGrid stroke="#14261A" strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#14261A99' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#14261A99' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, borderColor: '#14261A1a' }} />
                <Line type="monotone" dataKey="scans" stroke={MOSS} strokeWidth={2} dot={{ fill: MOSS, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Issue severity breakdown">
          {severityData.length === 0 ? (
            <EmptyChart label="No scans yet" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, borderColor: '#14261A1a' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 justify-center mt-2">
            {severityData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-ink/60">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[d.name] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Plants by location">
          {locationData.length === 0 ? (
            <EmptyChart label="No plants yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={locationData}>
                <CartesianGrid stroke="#14261A" strokeOpacity={0.08} vertical={false} />
                <XAxis dataKey="location" tick={{ fontSize: 11, fill: '#14261A99' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#14261A99' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, borderColor: '#14261A1a' }} />
                <Bar dataKey="count" fill={GOLD} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Most common issue">
          <div className="h-[220px] flex items-center justify-center text-center px-6">
            <p className="font-display text-2xl text-ink">{mostCommonIssue}</p>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`border-l-4 ${accent} border-y border-r border-ink/10 rounded-card bg-white/60 px-5 py-4`}>
      <p className="font-mono text-[10px] tracking-[0.1em] text-ink/45 mb-1">{label.toUpperCase()}</p>
      <p className="font-display text-2xl text-ink">{value}</p>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="border border-ink/10 rounded-card bg-white/60 p-6">
      <p className="font-mono text-[11px] tracking-[0.1em] text-ink/50 mb-4">{title.toUpperCase()}</p>
      {children}
    </div>
  )
}

function EmptyChart({ label }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-ink/30 text-sm font-mono">
      {label}
    </div>
  )
}
