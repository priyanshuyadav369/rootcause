import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'

export default function Cart() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    setLoading(true)
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, product:products(id, name, price)')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setItems(data)
    setLoading(false)
  }

  async function updateQuantity(id, quantity) {
    if (quantity < 1) return
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', id)
    if (error) setError(error.message)
    else setItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity } : it)))
  }

  async function removeItem(id) {
    const { error } = await supabase.from('cart_items').delete().eq('id', id)
    if (error) setError(error.message)
    else setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const total = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0)

  async function handleCheckout() {
    if (items.length === 0) return
    setCheckingOut(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: userData.user.id, total_amount: total, status: 'confirmed' })
      .select()
      .single()

    if (orderError) {
      setError(orderError.message)
      setCheckingOut(false)
      return
    }

    const orderItems = items.map((it) => ({
      order_id: order.id,
      product_id: it.product.id,
      quantity: it.quantity,
      price_at_purchase: it.product.price,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      setError(itemsError.message)
      setCheckingOut(false)
      return
    }

    // clear the cart
    await supabase.from('cart_items').delete().eq('user_id', userData.user.id)

    setCheckingOut(false)
    navigate('/orders')
  }

  return (
    <div className="p-8 max-w-3xl">
      <p className="font-mono text-[11px] tracking-[0.15em] text-moss mb-2">CART</p>
      <h1 className="font-display text-3xl text-ink mb-1">Your cart</h1>
      <p className="text-ink/60 mb-8">
        Checkout creates an order record — no real payment gateway is involved.
      </p>

      {error && (
        <p className="text-alert text-sm bg-alert-light rounded-card px-3 py-2 mb-4">{error}</p>
      )}

      {loading ? (
        <p className="font-mono text-xs tracking-[0.1em] text-ink/40">LOADING…</p>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-ink/20 rounded-card p-10 text-center text-ink/40 text-sm">
          Cart is empty — <Link to="/shop" className="text-moss underline">browse the shop</Link>.
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            {items.map((it) => (
              <div key={it.id} className="border border-ink/10 rounded-card bg-white/60 px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg text-ink">{it.product.name}</p>
                  <p className="text-xs text-ink/50 font-mono">₹{it.product.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(it.id, it.quantity - 1)} className="text-ink/50 hover:text-moss p-1">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm">{it.quantity}</span>
                  <button onClick={() => updateQuantity(it.id, it.quantity + 1)} className="text-ink/50 hover:text-moss p-1">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="font-mono text-sm text-ink w-16 text-right">
                  ₹{(it.product.price * it.quantity).toFixed(2)}
                </span>
                <button onClick={() => removeItem(it.id)} className="text-ink/40 hover:text-alert p-1.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-ink/10 pt-6">
            <p className="font-display text-xl text-ink">
              Total: <span className="text-moss">₹{total.toFixed(2)}</span>
            </p>
            <Button onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? 'Placing order…' : 'Complete order'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
