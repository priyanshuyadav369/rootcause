import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Sprout, ScanLine, ShoppingBag, ShoppingCart,
  Receipt, BarChart3, MessageSquareText, Mail, LogOut,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/plants', label: 'My Plants', icon: Sprout },
  { to: '/scan', label: 'Scan', icon: ScanLine },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/orders', label: 'Orders', icon: Receipt },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/insights', label: 'Ask AI', icon: MessageSquareText },
  { to: '/reports', label: 'Reports', icon: Mail },
]

export function DashboardLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-60 shrink-0 border-r border-ink/10 bg-white/50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-ink/10">
          <span className="w-6 h-6 rounded-sm bg-gold flex items-center justify-center mr-2.5">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-ink" fill="currentColor">
              <path d="M6 18C6 10 11 6 18 6C18 13.5 14 18 8.5 18C7.6 18 6.7 18 6 18Z" />
            </svg>
          </span>
          <span className="font-display text-lg text-ink">RootCause</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-card text-sm transition-colors',
                  isActive
                    ? 'bg-moss text-paper'
                    : 'text-ink/70 hover:bg-moss-light'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-ink/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-card text-sm text-ink/60 hover:bg-alert/10 hover:text-alert transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
