import React from 'react'
import { cn } from '@/lib/utils'

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-card border border-ink/10 bg-white/60 backdrop-blur-sm',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pb-3', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('font-display text-xl text-ink', className)} {...props} />
))
CardTitle.displayName = 'CardTitle'

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0 text-ink/70', className)} {...props} />
))
CardContent.displayName = 'CardContent'
