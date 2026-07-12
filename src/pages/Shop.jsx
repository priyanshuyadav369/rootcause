import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'pesticide', label: 'Pesticide' },
  { value: 'soil-amendment', label: 'Soil amendment' },
  { value: 'tool', label: 'Tool' },
]

export default function Shop() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('all')
  const [addingId, setAddingId] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setProducts(data)
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(
    () => (category === 'all' ? products : products.filter((p) => p.category === category)),
    [products, category]
  )

  async function addToCart(product) {
    setAddingId(product.id)
    setError('')

    const { data: userData } = await supabase.auth.getUser()

    // one row per (user, product) — upsert bumps quantity if it already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userData.user.id)
      .eq('product_id', product.id)
      .maybeSingle()

    let dbError
    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
      dbError = error
    } else {
      const { error } = await supabase.from('cart_items').insert({
        user_id: userData.user.id,
        product_id: product.id,
        quantity: 1,
      })
      dbError = error
    }

    setAddingId(null)

    if (dbError) {
      setError(dbError.message)
      return
    }

    setToast(`${product.name} added to cart`)
    setTimeout(() => setToast(''), 2000)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">SHOP</p>
          <h1 className="font-display text-3xl text-ink mb-1">Fertilizers, compost &amp; treatments</h1>
          <p className="text-ink/60">Every product is tagged to the issues it treats.</p>
        </div>
        <Button as={Link} to="/cart" variant="outline" size="sm" className="shrink-0">
          <ShoppingCart className="w-4 h-4" />
          View cart
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`font-mono text-[11px] tracking-[0.08em] px-3 py-1.5 rounded-sm border transition-colors ${
              category === c.value
                ? 'bg-moss text-paper border-moss'
                : 'border-ink/15 text-ink/60 hover:border-moss'
            }`}
          >
            {c.label.toUpperCase()}
          </button>
        ))}
      </div>

      {toast && (
        <p className="text-moss-dark text-sm bg-moss-light rounded-card px-3 py-2 mb-4 inline-block">{toast}</p>
      )}
      {error && (
        <p className="text-alert text-sm bg-alert-light rounded-card px-3 py-2 mb-4">{error}</p>
      )}

      {loading ? (
        <p className="font-mono text-xs tracking-[0.1em] text-ink/40">LOADING…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="border border-ink/10 rounded-card bg-white/60 p-5 flex flex-col">
              <div className="flex items-center justify-center h-24 mb-4 border border-dashed border-ink/15 rounded-sm">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-moss/60" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M4 8L12 4l8 4v8l-8 4-8-4V8z" />
                  <path d="M4 8l8 4 8-4M12 12v8" />
                </svg>
              </div>
              <p className="font-mono text-[10px] tracking-[0.08em] text-ink/40 mb-1 uppercase">{p.category.replace('-', ' ')}</p>
              <h3 className="font-display text-lg text-ink mb-1">{p.name}</h3>
              <p className="text-xs text-ink/55 leading-relaxed mb-4 flex-1">{p.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-moss text-sm">₹{p.price}</span>
                <Button size="sm" onClick={() => addToCart(p)} disabled={addingId === p.id}>
                  {addingId === p.id ? 'Adding…' : 'Add to cart'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
