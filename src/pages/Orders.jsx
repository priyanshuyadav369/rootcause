import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'

const STATUS_STYLE = {
  pending: 'bg-gold-light text-ink',
  confirmed: 'bg-moss-light text-moss-dark',
  cancelled: 'bg-alert-light text-alert',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at, order_items(id, quantity, price_at_purchase, product:products(name))')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setOrders(data)
    setLoading(false)
  }

  async function cancelOrder(id) {
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id)
    if (error) setError(error.message)
    else setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)))
  }

  return (
    <div className="p-8 max-w-3xl">
      <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">ORDERS</p>
      <h1 className="font-display text-3xl text-ink mb-1">Order history</h1>
      <p className="text-ink/60 mb-8">View past orders, or cancel one that's still pending or confirmed.</p>

      {error && (
        <p className="text-alert text-sm bg-alert-light rounded-card px-3 py-2 mb-4">{error}</p>
      )}

      {loading ? (
        <p className="font-mono text-xs tracking-[0.1em] text-ink/40">LOADING…</p>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-ink/20 rounded-card p-10 text-center text-ink/40 text-sm">
          No orders yet — <Link to="/shop" className="text-moss underline">visit the shop</Link>.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border border-ink/10 rounded-card bg-white/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-mono text-xs text-ink/40">
                    {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="font-display text-lg text-ink">₹{Number(o.total_amount).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[10px] tracking-[0.08em] px-2.5 py-1 rounded-sm ${STATUS_STYLE[o.status]}`}>
                    {o.status.toUpperCase()}
                  </span>
                  {o.status !== 'cancelled' && (
                    <Button variant="outline" size="sm" onClick={() => cancelOrder(o.id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              <ul className="text-sm text-ink/60 space-y-1 border-t border-ink/10 pt-3">
                {o.order_items.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.product?.name ?? 'Product removed'} × {it.quantity}</span>
                    <span className="font-mono">₹{(it.price_at_purchase * it.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
