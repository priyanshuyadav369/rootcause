import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-card text-sm font-medium tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
  {
    variants: {
      variant: {
        primary: 'bg-moss text-paper hover:bg-moss-dark',
        gold: 'bg-gold text-ink hover:bg-gold-light',
        outline: 'border border-ink/20 text-ink hover:bg-ink hover:text-paper',
        ghost: 'text-ink hover:bg-moss-light',
        onDark: 'bg-paper text-ink hover:bg-gold hover:text-ink',
        link: 'text-moss underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export const Button = React.forwardRef(
  ({ className, variant, size, as: Comp = 'button', ...props }, ref) => {
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }
