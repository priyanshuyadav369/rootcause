import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Pencil, Check, X, ScanLine } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'

const LOCATIONS = ['balcony', 'terrace', 'indoor']

const STATUS_STYLE = {
  healthy: 'bg-moss-light text-moss-dark',
  watch: 'bg-gold-light text-ink',
  urgent: 'bg-alert-light text-alert',
}

export default function Plants() {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', species: '', location: 'balcony' })
  const [submitting, setSubmitting] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchPlants()
  }, [])

  async function fetchPlants() {
    setLoading(true)
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setPlants(data)
    setLoading(false)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from('plants').insert({
      user_id: userData.user.id,
      name: form.name.trim(),
      species: form.species.trim() || null,
      location: form.location,
    })

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    setForm({ name: '', species: '', location: 'balcony' })
    fetchPlants()
  }

  async function handleDelete(id) {
    if (!confirm('Remove this plant and all its scan history?')) return
    const { error } = await supabase.from('plants').delete().eq('id', id)
    if (error) setError(error.message)
    else setPlants((prev) => prev.filter((p) => p.id !== id))
  }

  function startEdit(plant) {
    setEditingId(plant.id)
    setEditForm({ name: plant.name, species: plant.species ?? '', location: plant.location })
  }

  async function saveEdit(id) {
    const { error } = await supabase
      .from('plants')
      .update({
        name: editForm.name.trim(),
        species: editForm.species.trim() || null,
        location: editForm.location,
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setEditingId(null)
    fetchPlants()
  }

  return (
    <div className="p-8 max-w-4xl">
      <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">MY PLANTS</p>
      <h1 className="font-display text-3xl text-ink mb-1">Your plant records</h1>
      <p className="text-ink/60 mb-8">Add a plant, then scan it any time something looks off.</p>

      <form
        onSubmit={handleAdd}
        className="border border-ink/10 rounded-card bg-white/60 p-6 mb-8 grid sm:grid-cols-[1.5fr_1.5fr_1fr_auto] gap-3 items-end"
      >
        <div>
          <label className="font-mono text-[10px] tracking-[0.1em] text-ink/50 block mb-1">NAME</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Tulsi #1"
            className="w-full border border-ink/15 rounded-card px-3 py-2.5 bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] tracking-[0.1em] text-ink/50 block mb-1">SPECIES</label>
          <input
            value={form.species}
            onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))}
            placeholder="e.g. Basil"
            className="w-full border border-ink/15 rounded-card px-3 py-2.5 bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] tracking-[0.1em] text-ink/50 block mb-1">LOCATION</label>
          <select
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full border border-ink/15 rounded-card px-3 py-2.5 bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add plant'}
        </Button>
      </form>

      {error && (
        <p className="text-alert text-sm mb-4 bg-alert-light rounded-card px-3 py-2">{error}</p>
      )}

      {loading ? (
        <p className="font-mono text-xs tracking-[0.1em] text-ink/40">LOADING…</p>
      ) : plants.length === 0 ? (
        <div className="border border-dashed border-ink/20 rounded-card p-10 text-center text-ink/40 text-sm">
          No plants yet — add your first one above.
        </div>
      ) : (
        <div className="space-y-2">
          {plants.map((plant) => (
            <div
              key={plant.id}
              className="border border-ink/10 rounded-card bg-white/60 px-5 py-4 flex items-center gap-4"
            >
              {editingId === plant.id ? (
                <>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="flex-1 border border-ink/15 rounded-card px-3 py-2 bg-paper text-sm"
                  />
                  <input
                    value={editForm.species}
                    onChange={(e) => setEditForm((f) => ({ ...f, species: e.target.value }))}
                    className="flex-1 border border-ink/15 rounded-card px-3 py-2 bg-paper text-sm"
                    placeholder="Species"
                  />
                  <select
                    value={editForm.location}
                    onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                    className="border border-ink/15 rounded-card px-3 py-2 bg-paper text-sm"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <button onClick={() => saveEdit(plant.id)} className="text-moss hover:text-moss-dark p-1.5">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-ink/40 hover:text-ink p-1.5">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg text-ink">{plant.name}</p>
                    <p className="text-xs text-ink/50">
                      {plant.species || 'Species not set'} · {plant.location}
                    </p>
                  </div>
                  <span className={`font-mono text-[10px] tracking-[0.08em] px-2.5 py-1 rounded-sm ${STATUS_STYLE[plant.current_status]}`}>
                    {plant.current_status.toUpperCase()}
                  </span>
                  <Link
                    to="/scan"
                    state={{ plantId: plant.id }}
                    className="text-ink/50 hover:text-moss p-1.5"
                    title="Scan this plant"
                  >
                    <ScanLine className="w-4 h-4" />
                  </Link>
                  <button onClick={() => startEdit(plant)} className="text-ink/50 hover:text-moss p-1.5">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(plant.id)} className="text-ink/50 hover:text-alert p-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
