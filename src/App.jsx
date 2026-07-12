import React from 'react'
import { Routes, Route } from 'react-router-dom'

import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Contact from '@/pages/Contact'
import NotFound from '@/pages/NotFound'

import Dashboard from '@/pages/Dashboard'
import Plants from '@/pages/Plants'
import Scan from '@/pages/Scan'
import Shop from '@/pages/Shop'
import Cart from '@/pages/Cart'
import Orders from '@/pages/Orders'
import Analytics from '@/pages/Analytics'
import Insights from '@/pages/Insights'
import Reports from '@/pages/Reports'

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Protected pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
